# adapt-authoring-mailer
Initial version of the adapt-authoring mailer module

## Configuration

Add this snippet (just as example!) to dev.config.js
    
    ...
    ,
      "adapt-authoring-mailer": {
        "enable": true,
        "useConnectionUrl": false,
        "host": "smtp.ethereal.email",
        "port": 587,
        "user": "whitney2@ethereal.email",
        "pass": "f2e1ZjCkNxvpN5PaRK",
        "from": "yourmail@domain.com",
        "connectionUrl": "smtp://whitney2@ethereal.email:f2e1ZjCkNxvpN5PaRK@smtp.ethereal.email"
      }
      
      
or run "generate-config" script on the main app.


## Test

Manual Testing has been done agaist an ethereal fake smtp account
see: https://ethereal.email/

But Testcode still missing for that.
 


