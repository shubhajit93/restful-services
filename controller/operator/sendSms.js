
const fetch = require('node-fetch');
var signature = require('../../utility/signature')
var login = require('../operator/login')
const config = require('../../config/config');
const logger = require('../../utility/logger');

const NULL = 'null';

var refreshRequestStatus;
var newAppendedString;


async function _24HoursFormat()
{
    let timeStamp = new Date();
    let timeStampString = `${timeStamp.getFullYear()}${timeStamp.getUTCMonth()}${timeStamp.getUTCDate()}${timeStamp.getUTCHours()}${timeStamp.getUTCMinutes()}${timeStamp.getUTCSeconds()}`;
    return timeStampString;
    
}

async function makeMessageBody(applnType, profile, subProfile, msisdn, languageType, smsContent)
{
    return JSON.stringify({
            "sendSmsReq" : {
                "applnType": applnType,
                "profile": profile,
                "subProfile": subProfile,
                "msisdn": msisdn,
                "languageType": languageType,
                "smsContent" : smsContent

            }
        });
    
}

async function makeAppendedString(url,applnType, profile, subProfile, msisdn, languageType, smsContent)
{
    let message = await makeMessageBody(applnType, profile, subProfile, msisdn, languageType, smsContent);

    newAppendedString = new Date().toISOString() + url + message;
    //console.log(result);
}



function checkStatus(res) {
    if (res.ok) { 
        return res;
    } else {
        throw MyCustomError(res.statusText);
    }
};




// REFRESHING
async function refreshToken(url, refreshtoken, timeStamp, msgid)
{
    var requestReplyStatus = 0;

    var headers = {
        oauth_client_key: config.headers_parameters.sms.oauth_client_key, 
        refresh_token: refreshtoken,
        oauth_timestamp: timeStamp,
        oauth_nonce: msgid+'', 
        'Content-type': "application/json", 
        device_id:config.headers_parameters.sms.device_id 
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
        smsAccessToken = body.access_token;
        smsRefreshtoken = body.refresh_token;
        var refreshTokenRespMessage = 'refreshToken response parameters:'+'\n'+JSON.stringify(body);
        logger.log(refreshTokenRespMessage, 'debug');
        if(smsAccessToken == null){
            requestReplyStatus = 0;
        }
        else{
            requestReplyStatus = 1;

        }
    })
    .catch(function(error) {
        logger.log("REFRESH Request Error:"+error, 'error');
        
    });

    return requestReplyStatus;
}

// SMS SENDING
async function smsSending(url, AccessToken, msisdn, smsContent, msgid)
{
    var requestReplyStatus = 0;
    var smsBODY = JSON.stringify({
        "sendSmsReq" : {
            "applnType": config.smsRequest_parameters.applnType,
            "profile": config.smsRequest_parameters.profile,
            "subProfile": config.smsRequest_parameters.subProfile,
            "msisdn": msisdn,
            "languageType": config.smsRequest_parameters.languageType,
            "smsContent" : smsContent

        }
    });
    
    var newTimeStamp = `${new Date().toISOString().slice(0,19)}Z`;
    newAppendedString = newTimeStamp + '/esb/sms/SEND_SMS_ONLINE' + smsBODY;
    var newSIGNATURE = await signature.createSignature(config.headers_parameters.sms.secret_key, newAppendedString);
    
    //console.log("access token:"+AccessToken);
    //console.log("sms body:"+smsBODY);

    var headers = {
        'oauth_client_key': config.headers_parameters.sms.oauth_client_key,
        'oauth_timestamp': newTimeStamp,
        'oauth_signature': newSIGNATURE,
        'oauth_nonce': msgid+'',
        'access_token': AccessToken,
        'Content-Type': 'application/json',
        'device_id':config.headers_parameters.sms.device_id,
        'source_channel':config.headers_parameters.sms.source_channel,
        'country_code':'MY'

    }
    var tmpRespHeader = '';
    var tmpRespBody = '';
    var smsReqMessage = 'sendSmsOnline request parameters:'+'\n'+JSON.stringify(headers)+'\n'+smsBODY+'\n';
    logger.log(smsReqMessage, 'debug');


    await fetch(url,{

        method: 'POST',
        headers: headers,

        body: smsBODY
            
    
    })
    .then(function (res){

        console.log("SMS RESPONSE STATUS| ",+ res.status);
        requestReplyStatus = res.status;
        
        if(res.headers.get('access_token') != null){
            smsAccessToken = res.headers.get('access_token');
            //console.log("AccessToken: "+ smsAccessToken);
        }

        tmpRespHeader = res.headers;
        if(requestReplyStatus == '200'){
            tmpRespBody = "SUCCESS";
            return tmpRespBody;
        }else{
            return res.json();
        }
       

    })
    .then(function (body) {
        if(body != "SUCCESS"){
            tmpRespBody = body;
        }

    })
    .catch(function(error) {
        logger.log("Error:", 'debug')
        logger.log(error, 'error')
        requestReplyStatus = 0;
    });

        
    var smsRespMessage = 'sendSmsOnline response parameters:';
    logger.log(smsRespMessage, 'debug');
    logger.log(tmpRespHeader, 'debug');
    
    var smsRespMessage = tmpRespBody;
    logger.log(smsRespMessage, 'debug');

    return requestReplyStatus;
};


async function processRequest(req)
{
    var login_token = 0;
    var requestReplyStatus = 0;
    var response;
    
        
    requestReplyStatus = await smsSending(config.urls.sendSmsOnlineUrl, smsAccessToken, req.query.msisdn, req.query.smsContent, req.query.msgid)
    //console.log("SMS requestReplyStatus:"+requestReplyStatus);   
    if(requestReplyStatus == '200'){
        //console.log("1 sms is sent");
        console.log(`SMS SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
        response = 'SENT|';
    }
    else{

        if(requestReplyStatus == '401') // expired access token
        {
        console.log("--------------FIRST TIME REQUESTING NEW ACCESS TOKEN--------------------");
            requestReplyStatus = await refreshToken(config.urls.refreshUrl, smsRefreshtoken, await _24HoursFormat(), req.query.msgid)
            
            if(refreshRequestStatus == 0)
            {
                console.log("----------------RE-LOGGING SESSION---------------------");
                var login_token = await login.logIn(config.urls.logInUrl, JSON.stringify({username : config.headers_parameters.sms.username, password : config.headers_parameters.sms.password}))
                if(login_token == 0){
                    response = 'FAILED|';
                    return false;
                }
                requestReplyStatus = await smsSending(config.urls.sendSmsOnlineUrl, smsAccessToken, req.query.msisdn, req.query.smsContent, req.query.msgid)
                    
                if(requestReplyStatus == '401') // expired access token
                {
                    //console.log("**** second time sms request failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == 0){
                    //console.log("**** sent failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == '200'){
                    response = 'SENT|';
                    console.log(`SMS SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
                }
                else{
                    response = 'FAILED|';
                }    


            }
            else{
                requestReplyStatus = await smsSending(config.urls.sendSmsOnlineUrl, smsAccessToken, req.query.msisdn, req.query.smsContent, req.query.msgid)
                    
                if(requestReplyStatus == '401') // expired access token
                {
                    //console.log("**** second time sms request failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == 0){
                    //console.log("**** sent failed*****");
                    response = 'FAILED|';
                }
                else if(requestReplyStatus == '200'){
                    response = 'SENT|';
                    console.log(`SMS SUCCESSFULLY SENT FOR MSISDN ${req.query.msisdn}`);
                }
                else{
                    response = 'FAILED|';
                }    
            }            
                
        
        }
        else{
            //console.log("**** sent failed*****");
            response = 'FAILED|';
        }

    }    
    return response;

}
exports.sendsms = async function (req, res) {
    var response = await processRequest(req)
    res.send(response);
    console.log("SMS RESPONSE | "+ response);

};


