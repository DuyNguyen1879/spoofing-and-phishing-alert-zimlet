/*
This file is part of the Spam Assassin Alert Zimlet.
Copyright (C) 2015-2017  Barry de Graaff

Bugs and feedback: https://github.com/Zimbra-Community/sa-alert-zimlet

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
*/
/**
 * This zimlet checks for X-Spam-Status message header and alerts the user when certain tags are found.
 */
function tk_barrydegraaff_sa_alert_HandlerObject() {
}

tk_barrydegraaff_sa_alert_HandlerObject.prototype = new ZmZimletBase();
tk_barrydegraaff_sa_alert_HandlerObject.prototype.constructor = tk_barrydegraaff_sa_alert_HandlerObject;

/**
 * Simplify handler object
 *
 */
var SA_AlertZimlet = tk_barrydegraaff_sa_alert_HandlerObject;

/**
 * Initializes the zimlet.
 */
SA_AlertZimlet.prototype.init =
function() {
   AjxPackage.require({name:"MailCore", callback:new AjxCallback(this, this._applyRequestHeaders)});

   //mailsploit
   try {
      if(appCtxt.getSettings().getSetting('SHORT_ADDRESS').value == true)
      {
         var soapDoc = AjxSoapDoc.create("ModifyPrefsRequest", "urn:zimbraAccount");
         var zimbraPrefShortEmailAddressNode;

         zimbraPrefShortEmailAddressNode = soapDoc.set("pref", "FALSE");
         zimbraPrefShortEmailAddressNode.setAttribute("name", "zimbraPrefShortEmailAddress");

         appCtxt.getAppController().sendRequest({
            soapDoc: soapDoc,
            asyncMode: true
         });
         console.log('Sa-Alert-Zimlet: Altered setting zimbraPrefShortEmailAddress, works from next reload of the browser');
      }
   }
   catch (err) 
   {
      console.log('Sa-Alert-Zimlet: Altered setting zimbraPrefShortEmailAddress FAILED' + err);
   }
};

/**
 * Applies the request headers.
 * 
 */
SA_AlertZimlet.prototype._applyRequestHeaders =
function() {	
	ZmMailMsg.requestHeaders["X-Spam-Status"] = "X-Spam-Status";
   ZmMailMsg.requestHeaders["Reply-To"] = "Reply-To";
   ZmMailMsg.requestHeaders["Return-Path"] = "Return-Path";
   ZmMailMsg.requestHeaders["From"] = "From";
};

SA_AlertZimlet.prototype.convert = function(input) {
  var output = "";
  output.value = "";
  for (var i = 0; i < input.length; i++) {
      output += input[i].charCodeAt(0) + " ";
  }
  return output;
};

SA_AlertZimlet.prototype.onMsgView = function (msg, oldMsg, view) {
   try
   {
      var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_sa_alert').handlerObject;   
      var alertmail = zimletInstance._zimletContext.getConfig("alertmail"); 
      var ignorelistReplyTo = zimletInstance._zimletContext.getConfig("ignorelistReplyTo");
      if (!(!ignorelistReplyTo || ignorelistReplyTo.length === 0))
      {
         ignorelistReplyTo = ignorelistReplyTo.split(";");
      }

      var ignorelistReturnPath = zimletInstance._zimletContext.getConfig("ignorelistReturnPath");
      if (!(!ignorelistReturnPath || ignorelistReturnPath.length === 0))
      {
         ignorelistReturnPath = ignorelistReturnPath.split(";");
      }

      var alertedIds = zimletInstance.getUserProperty("alertedIds");
      if(!alertedIds)
      {
         alertedIds = "";
      }

      if((msg.attrs['X-Spam-Status'].indexOf('URI_PHISH') > 0) || (msg.attrs['X-Spam-Status'].indexOf('FREEMAIL_FORGED_REPLYTO') > 0) ||
      (msg.attrs['From'].indexOf('=0D') > -1) || (msg.attrs['From'].indexOf('=0A') > -1) || ((msg.attrs['From'].indexOf('=00') > -1)) //mailsploit
      )
      {
         var ignoreThis = false;
         if (!(!ignorelistReplyTo || ignorelistReplyTo.length === 0))
         {
            ignorelistReplyTo.forEach(function(ignore) {
                if((msg.attrs['Reply-To'].indexOf(ignore) > -1) && (ignore.length > 0))
                {
                    ignoreThis = true;
                }
            });
         }

         if (!(!ignorelistReturnPath || ignorelistReturnPath.length === 0))
         {
            ignorelistReturnPath.forEach(function(ignore) {
                if((msg.attrs['Return-Path'].indexOf(ignore) > -1) && (ignore.length > 0))
                {
                ignoreThis = true;
                }
            });
         }

         if(ignoreThis)
         {
            return;
         }

         SA_AlertZimlet.prototype._dialog = new ZmDialog( { title:'Spoofing and Phishing alert', parent:this.getShell(), standardButtons:[DwtDialog.OK_BUTTON], disposeOnPopDown:true } );
         var alertmailTxt = "";
         if((alertmail) && (alertedIds.indexOf(","+msg.id))<0)
         {
            alertmailTxt = "The message is automatically forwarded to: " + alertmail;
         }
         SA_AlertZimlet.prototype._dialog.setContent(
         '<b>' +
         'Based on the headers of this email, there is a chance this is a phishing or spoofed mail.' + '<br>' +
         '<ul>' +
         '<li>' + 'Do not click on any links in the mail' + '</li>' +
         '<li>' + 'Do not download any attachments' + '</li>' +
         '<li>' + 'Do not open any attachments' + '</li>' +
         '<li>' + 'Do not reply to this email' + '</li>' +
         '<li>' + 'Do not forward this email' + '</li>' +
         '</ul>' +
         '</b>' + '</b><br><br>Please mark the message as spam.<br>' + alertmailTxt);
         SA_AlertZimlet.prototype._dialog.popup();
         if((alertmail) && (alertedIds.indexOf(","+msg.id))<0)
         {
            SA_AlertZimlet.prototype.notifyAttach(msg.id);
            alertedIds[msg.id] = msg.id;
            zimletInstance.setUserProperty("alertedIds", alertedIds +","+msg.id, true);
         }
      }
   } catch (err)
   {
     // X-Spam-Status header not found
   }
};

/** Send this message to the configured helpdesk for analysis
 * */
SA_AlertZimlet.prototype.notifyAttach = function (id) {
   var zimletInstance = appCtxt._zimletMgr.getZimletByName('tk_barrydegraaff_sa_alert').handlerObject;
   var alertmail = zimletInstance._zimletContext.getConfig("alertmail");

   if(alertmail)
   {
      var url = [];
      var i = 0;
      var proto = location.protocol;
      var port = Number(location.port);
      url[i++] = proto;
      url[i++] = "//";
      url[i++] = location.hostname;
      if (port && ((proto == ZmSetting.PROTO_HTTP && port != ZmSetting.HTTP_DEFAULT_PORT) 
      || (proto == ZmSetting.PROTO_HTTPS && port != ZmSetting.HTTPS_DEFAULT_PORT))) {
      url[i++] = ":";
      url[i++] = port;
      }
      url[i++] = "/home/";
      url[i++]= AjxStringUtil.urlComponentEncode(appCtxt.getActiveAccount().name);
      url[i++] = "/message.txt?fmt=txt"+"&id=";
      url[i++] = id;

      var getUrl = url.join("");

      //Now make an ajax request and read the contents of this mail, including all attachments as text
      //it should be base64 encoded
      var xmlHttp = null;
      xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", getUrl, false );
      xmlHttp.send( null );

      //Check for duplicate filename
      var composeView = appCtxt.getCurrentView();

      req = new XMLHttpRequest();
      req.open("POST", "/service/upload?fmt=extended,raw", true);
      req.setRequestHeader("Cache-Control", "no-cache");
      req.setRequestHeader("X-Requested-With", "XMLHttpRequest");
      req.setRequestHeader("Content-Type",  "text/plain" + ";");
      req.setRequestHeader("X-Zimbra-Csrf-Token", window.csrfToken);
      req.setRequestHeader("Content-Disposition", 'attachment; filename="message.eml"');

      var myWindow = this;
      myWindow.idsToAttach = [];
      req.onload = function(e)
      {
         var resp = eval("["+req.responseText+"]");
         var respObj = resp[2];
         var attId = "";
         for (var i = 0; i < respObj.length; i++)
         {
            if(respObj[i].aid != "undefined") {
               myWindow.idsToAttach.push(respObj[i].aid);
               var attachment_list = myWindow.idsToAttach.join(",");


              var cc = AjxDispatcher.run("GetComposeController");
              var htmlCompose = appCtxt.get(ZmSetting.COMPOSE_AS_FORMAT) === ZmSetting.COMPOSE_HTML;
              var extraBodyText = [];

              cc._setView({
                 action: ZmOperation.NEW_MESSAGE,
                 inNewWindow: false,
                 msg: new ZmMailMsg(),
                 toOverride: alertmail,
                 subjOverride: "Automatically submitted email for spoof check (tk_barrydegraaff_sa_alert)",
                 extraBodyText: "Automatically submitted email for spoof check (tk_barrydegraaff_sa_alert)"
              });
              cc.sendMsg([].concat(attachment_list).join(","));
            }
         }
      }
      req.send(xmlHttp.responseText);
   }
};

/* This is here for debugging string at binary level
 *
 * */
SA_AlertZimlet.prototype.convert = function(input) {
   var output = "";
   output.value = "";
   for (var i = 0; i < input.length; i++) {
      output += input[i].charCodeAt(0) + " ";
   }
   return output;
};
