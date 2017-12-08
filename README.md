# sa-alert-zimlet
This zimlet checks for X-Spam-Status message header and alerts the user when certain tags are found

# Recommended security setting
This will help users to identify spoofed emails, this setting is also enforced per user when you enable this zimlet.
For the default COS (remeber to set it for all your COS'es):
zmprov mc default zimbraPrefShortEmailAddress FALSE

# Automatically notify your helpdesk
You can have your users automatically submit suspicious mail to your helpdesk staff by configuring the `alertmail` property in config_template.xml.

# Ignore trusted reply-to's
You can set trusted reply-to's by adding a semi-colon separated list in `ignorelistReplyTo`

# Ignore trusted return-path's
You can set trusted reply-to's by adding a semi-colon separated list in `ignorelistReturnPath`

# Help us improve!
Please help us and add more Spam Assassin tags to this Zimlet, just open a Github issue 
and copy SA message headers of Phishing mail.

