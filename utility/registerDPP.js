// DPP REGISTRY
//const config = require('../../config/config');
const logger = require('./logger');
const fetch = require('node-fetch');

exports.registerDPP = async function(dppRegistryUrl, req, statusCode, startTime) {

    var registryResponse = "??";
    var dpp_endTime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); //new Date().toISOString();
    var url = dppRegistryUrl;
    var requestbody = JSON.stringify(
        {
            "dpp_cdrid" : req.query.msgid,
            "dpp_serviceID" : req.query.offerID,
            "dpp_msisdn" : req.query.msisdn,
            "dpp_result" : statusCode,
            "dpp_startTime" : startTime,
            "dpp_endTime" : dpp_endTime
        }
    )

    var token = 0;

    var headers = {
        'Content-Type': "application/json",
    }

    await fetch(url,{

        method: 'POST',

        headers: headers,

        body: requestbody

    })
    .then(res =>res.text())
    .then(function (body){
        registryResponse = body;
        
    })
    .catch(function(error) {
        logger.log("DPP Registry Error:", 'debug');
        logger.log(error, 'debug');
        token = 0;
    });
    logger.log(registryResponse, 'debug');
    
};
