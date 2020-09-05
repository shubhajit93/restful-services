
const fetch = require ('node-fetch');
const config = require('../config/config');
const logger = require('../utility/logger');
const timeStamp = require('../utility/timeStamp'); 

async function smsHandler(req)
{
    var resultCode = 0;
    //console.log(`${await timeStamp.serverTimeStamp()} | SMS | `+JSON.stringify(req.body));
    //console.log(`${await dateTime.serverTimeStamp()} | SMS | `+JSON.stringify(req.body));
    
    var BODY = JSON.stringify(req.body);

    var option = {
        method : config.smsHandlerInfo.method,
        headers : {
            'Content-Type': 'application/json' 
        },
        body : BODY
    }

    //logger.log("SMS REQUEST | "+option.body, 'debug');

    await fetch(config.smsHandlerInfo.baseUrl, option)
    .then(response => response.text())
    .then(function(response){
        if(response.trim() == 'SUCCESS'){
            resultCode = 1;
        }

        logger.log(`SMS | ${BODY} | RESPONSE STATUS | ${response.trim()}`, 'debug');
        
    })
    .catch(function(error){
        //console.log(`SMS | ${BODY} | REQUEST ERROR | ${error}`);
        logger.log(`SMS | ${BODY} | REQUEST ERROR | ${error}`,'debug');
    });

    return resultCode;

}

exports.sendSms = async function(req, res) {
    var resultCode = 0;
    var resultCode = await smsHandler(req, res);
    
    if(resultCode)
    {
        //res.send('SENT|');
        res.send(response.sent);
        //console.log(`${await timeStamp.serverTimeStamp()} | SMS | ${JSON.stringify(req.body)} | SENT`);
    }
    else{
        res.send('FAILED|');
        //console.log(`${await timeStamp.serverTimeStamp()} | SMS | ${JSON.stringify(req.body)} | FAILED`);
    }
    
}