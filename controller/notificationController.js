
const config = require('../config/config');
const fetch = require('node-fetch');
const logger = require('../utility/logger');
const timeStamp = require('../utility/timeStamp');
const db = require('../model/dbLib');


async function validateRequest(userID, userMSISDN, instanceID)
{
    if((userID || userMSISDN) && instanceID)
        return true;
    return false;
}


async function saveToken(req, res)
{
    var resultCode = 0;

    var data = req.body;
    //console.log(JSON.stringify(data));

    var userID = data.userID;
    var userMSISDN = data.userMSISDN;
    var instanceID = data.instanceID;
    var token = data.token;
    var deviceInfo = data.deviceInfo;
    
    
    let validRequest = await validateRequest(userID, userMSISDN, instanceID);

    if(validRequest)
    {
        
        var insertClause = `INSERT INTO notification_users (user_id, MSISDN, instance_id, token, device_info) VALUES`;
        var values = `('${userID}', '${userMSISDN}', '${instanceID}', '${token}', '${deviceInfo}')`;
        var updateClause = `ON DUPLICATE KEY UPDATE token = VALUES(token)`;

        var queryString = insertClause + values + updateClause;
        //console.log(queryString);

        resultCode = await db.save(pool, queryString);
        
        if(resultCode)
        {
            res.send(response.success.success203); //res.send("TOKEN SAVED");
            //console.log(`${await timeStamp.serverTimeStamp()} | TOKEN | ${JSON.stringify(data)} | SAVED`);
            logger.log(`TOKEN | ${JSON.stringify(data)} | SAVED`, 'debug');

        }
        else
        {
            res.send(response.error.error402); //res.send("FAILED");
            //console.log(`${await timeStamp.serverTimeStamp()} | TOKEN | ${JSON.stringify(data)} | SAVING FAILED`);
            logger.log("TOKEN SAVING FAILED | "+JSON.stringify(data), 'debug');

        }

    }
    else
    {
        res.send(response.error.error401);//res.send("INVALID REQUEST | userID/userMSISDN missing");
        //console.log(`${await timeStamp.serverTimeStamp()} | TOKEN | INVALID REQUEST | userID/userMSISDN missing`);
        logger.log("INVALID REQUEST | "+data, 'debug');

    }

    
}


async function send(REQUEST_BODY)
{
    var resultCode = 0;
    //console.log(`${Date()} | NOTIFICATION |`+REQUEST_BODY);
    
    var METHOD = 'POST';
    //console.log("Server Key | ", config.firebaseInfo.credential.serverKey);

    var HEADERS = {
        'Authorization': 'key=' + config.notificationHandlerInfo.firebaseInfo.credential.serverKey,
        'Content-Type': 'application/json'
    };

    var option = {
        method : METHOD,
        headers : HEADERS,
        body : REQUEST_BODY 
    }
    //console.log("Options | ", option);
    logger.log("FIREBASE REQUEST | "+option.body, 'debug');
    //console.log("url : ",config.firebaseInfo.sendUrl);

    await fetch(config.notificationHandlerInfo.firebaseInfo.sendUrl, option)
    .then(function(response){

        if (response.status == 200)
        {
            resultCode = 1;
        }

        return response.json();
    })
    .then(function(body){
        logger.log("NOTIFICATION | FIREBASE RESPONSE | "+JSON.stringify(body), 'debug');
    
    })
    .catch(function(error){
        //console.log(`${timeStamp.serverTimeStamp()} | NOTIFICATION | ${option} | CAST ERROR | ${error}`);
        logger.log("NOTIFICATION | ${option} | CAST ERROR | "+error, 'error');

    });

    return resultCode;

}

async function multicastNotification(req)
{
    var notification = req.body.data;

    var requestBody = JSON.stringify({
        'registration_ids': req.body.to.token,
        'notification': notification 
    });

    let resultCode = await send(requestBody);
    return resultCode;

}


async function broadcastNotification(req)
{
    var topic = req.body.to.topic;
    var notification = req.body.data;

    var requestBody = JSON.stringify({
        'notification': notification,
        'to': topic 
    });

    
    let resultCode = await send(requestBody);
    return resultCode;
}

async function cast(req, res)
{
    var Response = 0;
    //console.log(`${Date()} | NOTIFICATION |`+JSON.stringify(req.body));
    var to = req.body.to;
    
    if(to.hasOwnProperty('topic'))
    {
        Response = await broadcastNotification(req, res);
        if(Response){
            //res.send('SENT|');
            res.send(response.sent);
            
            //console.log(`${await timeStamp.serverTimeStamp()} | NOTIFICATION | ${JSON.stringify(req.body)} | SENT`);
        }
        else{
            //res.send('FAILED');
            res.send(response.failed);
            //console.log(`${await timeStamp.serverTimeStamp()} | NOTIFICATION | ${JSON.stringify(req.body)} | FAILED`);
        }

    }
    if(to.hasOwnProperty('token'))
    {
        Response = await multicastNotification(req, res);
        if(Response){
            //res.send('SENT|');
            res.send(response.sent);
            //console.log(`${await timeStamp.serverTimeStamp()} | NOTIFICATION | ${JSON.stringify(req.body)} | SENT`);
        }
        else{
            //res.send('FAILED');
            res.send(response.failed);
            //console.log(`${await timeStamp.serverTimeStamp()} | NOTIFICATION | ${JSON.stringify(req.body)} | FAILED`)
        }
    } 

}

const notificationController = {
    cast : cast,
    saveToken : saveToken
}

module.exports = notificationController;