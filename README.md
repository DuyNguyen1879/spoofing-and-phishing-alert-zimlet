Spoofing and Phishing Alert Zimlet
==========
If you find Spoof Alert Zimlet useful and want to support its continued development, you can make donations via:
- PayPal: info@barrydegraaff.tk
- Bank transfer: IBAN NL55ABNA0623226413 ; BIC ABNANL2A

This Zimlet can be used to help users to identify spoofing and thus offer protection against it. While some parts of this Zimlet work automatic, it is recommended you deploy it with a knowledgeable helpdesk to back it up.

This zimlet checks the result from Spam Assassin and alerts the user when certain tags are found. In addition it enforces the zimbraPrefShortEmailAddress setting to be FALSE as that allows the user to see the used email FROM address. The Zimlet also checks for suspicious characters in headers, like the NULL character etc. 

I deployed the Zimlet in an organisation with 700 users, and pointed the `alertmail` property to the helpdesk ticket system, after a few weeks of increased tickets and configuring the `ignorelistReplyTo` and `ignorelistReturnPath` the number of false positives dropped, and now the alert is really valuable to the user.

# Installing Spoofing and Phishing Alert Zimlet
The recommended method is to deploy using git.

```
# apt-get -y install git
# git clone https://github.com/btactic/spoofing-and-phishing-alert-zimlet.git
# cd spoofing-and-phishing-alert-zimlet
# chmod +rx build.sh
# ./build.sh
```

Now we can deploy the generated tk_barrydegraaff_sa_alert.zip as any other zimlet.

Otherwise you can fetch an already built zip file from our [spoofing-and-phishing-alert-zimlet releases](https://github.com/btactic/spoofing-and-phishing-alert-zimlet/releases).

Please check the *Do a learning period* section below too for a development deploy mode.

# Mailsploit patches
This zimlet contains patches for Mailsploit and sets zimbraPrefShortEmailAddress to false (applied after reload).

# Recommended security setting
This will help users to identify spoofed emails, this setting is also enforced per user when you enable this zimlet.
For the default COS (remeber to set it for all your COS'es):
```
zmprov mc default zimbraPrefShortEmailAddress FALSE
```

# Automatically notify your helpdesk
You can have your users automatically submit suspicious mail to your helpdesk staff by configuring the `alertmail` property in config_template.xml.

# Ignore trusted reply-to's
You can set trusted reply-to's by adding a semi-colon separated list in `ignorelistReplyTo`

# Ignore trusted return-path's
You can set trusted reply-to's by adding a semi-colon separated list in `ignorelistReturnPath`

# Do a learning period
Usually you will find your users will trigger some false-positives from services that do not use email properly. You may want to deploy this zimlet in development mode for a week or 3 so you can configure the above `ignore` lists on the fly. To deploy in development mode, unzip the contents of the zip to /opt/zimbra/zimlets-deployed/_dev/tk_barrydegraaff_sa_alert


