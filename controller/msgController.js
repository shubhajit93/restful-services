
const config = require('../config/config');
const logger = require('../utility/logger');
const timeStamp = require('../utility/timeStamp');
const db = require('../model/dbLib');

exports.send = async function send(req, resp)
{
    //console.log(req);
    //console.log(req.body);
    var queryString, tmpQueryString = '';
    var type = req.body.type;
    var ServiceID = config.serviceInfo.serviceID; 
    var destinationAddress = req.body.to;

    var message = JSON.stringify(req.body.data); 

    if(type.toString().trim() === 'MAIL' || type.toString().trim() === 'BOT')
    {

        for(let i=0; i < req.body.to.length; i++)
        {
            destinationAddress[i] = JSON.stringify(req.body.to[i]);
        }
    }
    
    if(type.toString().trim() == 'NOTIFICATION')
    {

        for(let i=0; i < req.body.to.length; i++)
        {
            destinationAddress[i] = JSON.stringify(req.body.to[i]);
        }
        
    }

    for(let i=0; i < req.body.to.length; i++)
    {
        queryString = '';
        queryString = `('${req.body.from}','${destinationAddress[i]}','${message}',NOW(),NOW(),'QUE',0,5,1,'${req.body.type}',0,0,0,0,'${req.body.refID}',NOW(),'1','1',NULL,0,'${ServiceID}',NULL,0,NULL,NULL,NULL,1)`; //'${req.body.schedule}'
    
        if(i != 0)
        {
            queryString = tmpQueryString.concat(',', queryString);
        }
        tmpQueryString = queryString;
        
    }

    let qry = "insert  into smsoutbox(srcMN,dstMN,msg,writeTime,sentTime,msgStatus,retryCount,srcTON,srcNPI,MsgType,Esm_Class,Data_Coding,smsPart,Totalpart,refID,schedule,srcAccount,destAccount,Remarks,channel,ServiceID,TransactionID,IsChargingEnable,ChargeResponse,SMSResponse,InstanceID,IsDlrCallbackEnable) VALUES ";
    queryString = qry.concat(queryString);

    if(queryString != ''){
        let resultCode = await db.save(pool, queryString);
        if(resultCode)
        {
            //console.log(`${await timeStamp.serverTimeStamp()} | ${type} | ${JSON.stringify(req.body)} | INSERTION STATUS | SUCCESSFUL`);
            logger.log(`${type} | ${JSON.stringify(req.body)} | INSERTION STATUS | SUCCESSFUL`);
            resp.status(200).send('Successfully inserted into DB');
        }
        else
        {
            //console.log(`${await timeStamp.serverTimeStamp()} | ${type} | ${JSON.stringify(req.body)} | INSERTION STATUS | FAILED`);
            logger.log(`${type} | ${JSON.stringify(req.body)} | INSERTION STATUS | FAILED`);
            resp.status(1064).send('Failed to insert into DB');

        }
        
    }     
    else
    {
        resp.status(400).send('data not found');
        //console.log(`${await timeStamp.serverTimeStamp()} | INSERTION STATUS | DATA NOT FOUND`);
        logger.log(`${await timeStamp.serverTimeStamp()} | INSERTION STATUS | DATA NOT FOUND`);

    }
        

}


