// LOG IN
var signature = require('../../utility/signature')
const config = require('../../config/config');
const logger = require('../../utility/logger');
const fetch = require('node-fetch');

exports.smsLogin = async function() {

    var url = config.urls.smslogInUrl;
    var requestbody = JSON.stringify({username : config.headers_parameters.sms.username, password : config.headers_parameters.sms.password})
    var logInTime = new Date().toISOString();
    var appended_string = logInTime + config.headers_parameters.sms.a_url + requestbody;
    //console.log(appended_string);
    SIGNATURE = await signature.createSignature(config.headers_parameters.sms.secret_key, appended_string);
    var token = 0;

    var headers = {
        oauth_client_key:config.headers_parameters.sms.oauth_client_key,
        oauth_timestamp: logInTime,
        oauth_signature: SIGNATURE,
        oauth_nonce: '32Sw987wer45',
        'Content-Type': "application/json",
        device_id: config.headers_parameters.sms.device_id

    }
    var loginReqMessage = 'intLogin request parameters:'+'\n'+JSON.stringify(headers)+'\n'+requestbody+'\n';
    logger.log(loginReqMessage, 'debug');

    await fetch(url,{

        method: 'POST',

        headers: headers,

        body: requestbody

    })
    .then(function(res){
        console.log('LOG IN STATUS | ',res.statusText);
        return res.json()
    })
    .then(function (body){
        smsAccessToken = body.access_token;
        smsRefreshtoken = body.refresh_token;

        var loginRespMessage = 'intLogin response parameters:'+'\n'+JSON.stringify(body)+'\n';
        logger.log(loginRespMessage, 'debug');
        
        if(smsAccessToken == null){
            token = 0;
        }
        else{
            token = 1;

        }
        
    })
    .catch(function(error) {
        logger.log("LOGIN Error:", 'debug');
        logger.log(error, 'debug');
        //console.log('Error: ', error);
        token = 0;
    });
    // sleep.sleep(5);
    if(!token)
        console.log("LOGIN | FAILED");
    
    return token;
};


exports.dppLogin = async function() {

    var url = config.urls.smslogInUrl;
    var requestbody = JSON.stringify({username : config.headers_parameters.dpp.username, password : config.headers_parameters.dpp.password})
    var logInTime = new Date().toISOString();
    var appended_string = logInTime + config.headers_parameters.dpp.a_url + requestbody;
    //console.log(appended_string);
    SIGNATURE = await signature.createSignature(config.headers_parameters.dpp.secret_key, appended_string);
    var token = 0;

    var headers = {
        oauth_client_key:config.headers_parameters.dpp.oauth_client_key,
        oauth_timestamp: logInTime,
        oauth_signature: SIGNATURE,
        oauth_nonce: '32Sw987wer45',
        'Content-Type': "application/json",
        device_id: config.headers_parameters.dpp.device_id

    }
    var loginReqMessage = 'DPP intLogin request parameters:'+'\n'+JSON.stringify(headers)+'\n'+requestbody+'\n';
    logger.log(loginReqMessage, 'debug');

    await fetch(url,{

        method: 'POST',

        headers: headers,

        body: requestbody

    })
    .then(function(res){
        console.log('DPP LOG IN STATUS | ',res.statusText);
        return res.json()
    })
    .then(function (body){
        dppAccessToken = body.access_token;
        dppRefreshtoken = body.refresh_token;

        var loginRespMessage = 'DPP intLogin response parameters:'+'\n'+JSON.stringify(body)+'\n';
        logger.log(loginRespMessage, 'debug');
        
        if(dppAccessToken == null){
            token = 0;
        }
        else{
            token = 1;

        }
        
    })
    .catch(function(error) {
        logger.log("DPP LOGIN Error:", 'debug');
        logger.log(error, 'debug');
        //console.log('Error: ', error);
        token = 0;
    });
  
    if(!token)
        console.log("DPP LOGIN | FAILED");

    return token;
};