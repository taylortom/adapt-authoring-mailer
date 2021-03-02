# adapt-authoring-mailer
Initial version of the adapt-authoring mailer module

## Configuration

Add this snippet (just as example!) to dev.config.js
    
    ...
    ,
       "adapt-authoring-mailer": {
        "isEnabled": true,
        "connectionUrl": "smtp://some@service.email:xyz@smtp.service.email"
    },
      
      

## Known problems

On windows, if you get an error message like "error self signed certificate in certificate chain", it might be due your 
antivirus scanner: see https://github.com/nodemailer/nodemailer/issues/406




 


