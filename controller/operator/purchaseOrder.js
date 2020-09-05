const fetch = require('node-fetch');
var signature = require('../../utility/signature')
var login = require('../operator/login')
const config = require('../../config/config');
const logger = require('../../utility/logger');
const { request } = require('http');
const { ok } = require('assert');

const registry = require('../../utility/registerDPP');

const NULL = 'null';

var refreshRequestStatus;
var newAppendedString;


async function _24HoursFormat()
{
    let timeStamp = new Date();
    let timeStampString = `${timeStamp.getFullYear()}${timeStamp.getUTCMonth()}${timeStamp.getUTCDate()}${timeStamp.getUTCHours()}${timeStamp.getUTCMinutes()}${timeStamp.getUTCSeconds()}`;
    return timeStampString;
    
}


// REFRESHING
async function dpprefreshToken(url, refreshtoken, timeStamp, msgid)
{
    var requestReplyStatus = 0;

    var headers = {
        oauth_client_key: config.headers_parameters.dpp.oauth_client_key, 
        refresh_token: refreshtoken,
        oauth_timestamp: timeStamp,
        oauth_nonce: msgid+'', 
        'Content-type': "application/json", 
        device_id:config.headers_parameters.dpp.device_id 
    }

    var refreshTokenReqMessage = 'refreshToken request parameters:'+'\n'+JSON.stringify(headers);
    logger.log(refreshTokenReqMessage, 'debug');

    await fetch(url, {
        method: 'GET',
        headers:headers


    })
    .then(function(res){
        console.log('REFRESH REQUEST STATUS ', res.statusText)
        return res.json();
    })
    .then(function (body){
        dppAccessToken = body.access_token;
        dppRefreshtoken = body.refresh_token;
        var refreshTokenRespMessage = 'DPP refreshToken response parameters:'+'\n'+JSON.stringify(body);
        logger.log(refreshTokenRespMessage, 'debug');
        if(dppAccessToken == null){
            requestReplyStatus = 0;
        }
        else{
            requestReplyStatus = 1;

        }
    })
    .catch(function(error) {
        logger.log("DPP REFRESH Request Error:"+error, 'error');
        
    });

    return requestReplyStatus;
}


// DPP SENDING
async function purchaseOrder(url, AccessToken, msisdn, offerID, msgid)
{
    var requestReplyStatus = 0;
    var BODY = JSON.stringify({
        "details":{
            "status-reason":{
                "reason-code":{
                   "$":"CHEDIT"
                }
             },

           "immPaymentDone":"false"

        },
        "parts":{
           "fulfilment-orders":[
              {
                 "type":{
                    "$":"AD"
                 }
              }
           ],
           "line-items":[
              {
                 "ids":[
                    {
                       "$":offerID,
                       "@scheme-name":"BO_ID"
                    }
                 ],
                 "subscription":{
                    "ids":[
                       {
                          "$":msisdn,
                          "@scheme-name":"MSISDN"
                       }
                    ]
                 }
              }
           ],
           "external-reference":[
              {
                 "id":{
                    "$":"N",
                    "@scheme-name":"CALLBACK_IND"
                 }
              }
           ]
        }
     });
    
    var newTimeStamp = `${new Date().toISOString().slice(0,19)}Z`;
    newAppendedString = newTimeStamp + '/salesOrder/proxCSM/ADD_LITE_ORDER_EXT' + BODY;
    var newSIGNATURE = await signature.createSignature(config.headers_parameters.dpp.secret_key, newAppendedString);
    
    //console.log("access token:"+AccessToken);
    //console.log("dpp body:"+BODY);

    var headers = {
        'oauth_client_key': config.headers_parameters.dpp.oauth_client_key,
        'oauth_timestamp': newTimeStamp,
        'oauth_signature': newSIGNATURE,
        'oauth_nonce': msgid+'',
        'access_token': AccessToken,
        'Content-Type': 'application/json',
        'device_id':config.headers_parameters.dpp.device_id,
        'source_channel':config.headers_parameters.dpp.source_channel,
        'country_code':'MY'

    }
    //console.log("dpp headers" + JSON.stringify(headers));
    var tmpRespHeader = '';
    var tmpRespBody = '';
    var smsReqMessage = 'dpp request parameters:'+'\n'+JSON.stringify(headers)+'\n'+BODY+'\n';
    logger.log(smsReqMessage, 'debug');


    await fetch(url,{

        method: 'POST',
        headers: headers,
        body: BODY    
    
    })
    .then(function (res){

        console.log("DPP RESPONSE STATUS| ",+ res.status);
        requestReplyStatus = res.status;
        
        if(res.headers.get('access_token') != null){
            dppAccessToken = res.headers.get('access_token');
            //console.log("AccessToken: "+ dppAccessToken);
        }

        tmpRespHeader = res.headers;
        if(requestReplyStatus == '201'){
            tmpRespBody = "SUCCESS";
            return tmpRespBody;
        }
        else{
            return res;
        }
            
    })
    .then(function (body) {
        
        if(body == "SUCCESS"){
        }
        else{
            tmpRespBody = body;
        }
            
    })
    .catch(function(error) {
        logger.log("Error:", 'debug')
        logger.log(error, 'error')
        console.log('******* dpp error********');
        console.log(error);
        requestReplyStatus = 0;
    });

    var smsRespMessage = 'dpp response parameters:';
    logger.log(smsRespMessage, 'debug');
    logger.log(tmpRespHeader, 'debug');
    
    var smsRespMessage = tmpRespBody;
    logger.log(smsRespMessage, 'debug');

    return requestReplyStatus;
};

var registryStatus = 'PROCESSING';


async function purchaseRequest(req)
{
    var login_token = 0;
    var requestReplyStatus = 0;
    var response;
    
        
    requestReplyStatus = await purchaseOrder(config.urls.dpplogInUrl, dppAccessToken, req.query.msisdn, req.query.offerID, req.query.msgid)
    //console.log("DPP requestReplyStatus:"+requestReplyStatus); 
    
    if(requestReplyStatus == '201'){
        response = 'SENT|';
        console.log(`PURCHASE REQUEST SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
    }
    else{

        if(requestReplyStatus == "401"){ //dpp expired access token
           
            console.log("----------------DPP RE-FRESHING SESSION---------------------");
            requestReplyStatus = await dpprefreshToken(config.urls.refreshUrl, dppRefreshtoken, await _24HoursFormat(), req.query.msgid) 
            
            if(refreshRequestStatus == 0) // dpp refresh token expired
            {
                console.log("----------------DPP RE-LOGGING SESSION---------------------");
                var login_token = await login.dpplogIn(config.urls.dpp.logInUrl, JSON.stringify({username : config.headers_parameters.dpp.username, password : config.headers_parameters.dpp.password}))
                if(login_token == 0){
                    response = 'FAILED|';
                    return response;
                }
                requestReplyStatus = await purchaseOrder(config.urls.dpplogInUrl, dppAccessToken, req.query.msisdn, req.query.offerID, req.query.msgid)
                    
                if(requestReplyStatus == '401') // expired access token
                {
                    //console.log("**** second time sms request failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == 0){
                    //console.log("**** sent failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == '201') {
                    response = 'SENT|';
                    console.log(`PURCHASE REQUEST SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
                }
                else{
                    response = 'FAILED|'
                }    

            }
            else{ // refresh success
                requestReplyStatus = await purchaseOrder(config.urls.dpplogInUrl, dppAccessToken, req.query.msisdn, req.query.offerID, req.query.msgid)
                    
                if(requestReplyStatus == '401') // expired access token
                {
                    console.log("**** second time sms request failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == 0){
                    //console.log("**** sent failed*****");
                    response = 'FAILED|';
                }
                else if (requestReplyStatus == '201'){
                    
                    response = 'SENT|';
                    console.log(`PURCHASE REQUEST SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
                }
                else{
                    response = 'FAILED|';
                }    
            }


        }
        else {
            //console.log("**** sent failed*****");
            response = 'FAILED|';
        }
        

    }    
    registryStatus = requestReplyStatus;
    return response;

}
exports.dataProvision = async function (req, res) {
    var startTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); //new Date().toISOString();
    var response = await purchaseRequest(req);
    res.send(response);
    console.log("DATA PROVISIONING RESPONSE | "+ response);
    await registry.registerDPP(config.urls.dppRegistryUrl, req, registryStatus, startTime);
    
};


