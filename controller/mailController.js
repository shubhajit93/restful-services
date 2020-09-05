
const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../utility/logger');
const timeStamp = require('../utility/timeStamp');
const fetch = require ('node-fetch');


async function mailHandler(req)
{
    var resultCode = 0;
    
    //console.log(`${Date()} | MAIL |`+JSON.stringify(req.body));
    // mailing through a mail server
    
    if(config.mailHandlerInfo.mailServerEnable)
    {
        var transporter = nodemailer.createTransport(config.mailHandlerInfo.mailServerInfo);
        
        transporter.verify(function(error) {
            if (error) {
              //console.log('MAIL SERVER VERIFICATION FAILED | ', error);              
            }
        });

        var message = {
            from: req.body.from,
            to: req.body.to.recipient,
            cc: req.body.to.cc,
            bcc: req.body.to.bcc,
            subject: req.body.data.subject,
            text: req.body.data.body
        };

    return new Promise(function(resolve){
        
        transporter.sendMail(message, function(error, info){
            if(error){

                //console.log(`${timeStamp.serverTimeStamp()}`+`| MAIL | ${message} | REQUEST ERROR | ${error}`);
                logger.log(`MAIL | ${message} | REQUEST ERROR | ${error}`,'debug');
                
            }
            else
            {
                //console.log('Email sent: ' + info.response);
                logger.log(`MAIL | ${message} | RESPONSE STATUS | ${info.response}`, 'debug');
                
                resultCode = 1;
                resolve(resultCode);
        
            }

        });

    })
    
    }
    else
    {// for third party API

        // new
        var main_body = 
        {
            "personalizations": [
                {
                    "to": [
                    {
                        "email": req.body.to.recipient,
                        //"name": "John Doe"
                    }
                    ],

                    "subject": req.body.data.subject
                }
            ],
            "content" : [
                {
                    "type" : "text/plain",
                    "value" : req.body.data.body
                }
            ],

            "from": 
            {
                "email": req.body.from,
                //"name": "John Doe"
            },

            "reply_to": 
            {
                "email": req.body.from,
                //"name": "John Doe"
            }

        }

        //
        
        var BODY = JSON.stringify(main_body);

        var option = {
            method : config.smsHandlerInfo.method,
            headers : {
                "authorization": "Bearer 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",
                'Content-Type': 'application/json' 
            },
            body : BODY
        }
    
        logger.log("MAIL REQUEST | "+option.body, 'debug');
    
        await fetch(config.mailHandlerInfo.mailerAPIIinfo.url, option)
        .then(function(response){
            if(response.status == '202'){
                resultCode = 1;
                //console.log("STATUS | SENT");

            }
            else{
                //console.log("STATUS | FAILED | "+response.status);
            }
            
            return response.text();
        })
        .then(function(response){
            logger.log("MAILER RESPONSE STATUS | "+response.trim(), 'debug');
        })
        .catch(function(error){
            //console.log("ERROR | ", error);
            logger.log("MAILER ERROR | "+error, 'debug');
 
    
        });

        return resultCode;

    }

}


exports.sendMail = async function (req, res) {
    var resultCode = 0;
    resultCode = await mailHandler(req, res);

    if(resultCode)
    {
        //res.send("SENT|");
        res.send(response.sent);
        //console.log(`${await timeStamp.serverTimeStamp()} | MAIL | ${JSON.stringify(req.body)} | SENT`);
    }
    else
    {
        //res.send("FAILED|");
        res.send(response.failed);
        //console.log(`${await timeStamp.serverTimeStamp()} | MAIL | ${JSON.stringify(req.body)} | FAILED`);
    }
};