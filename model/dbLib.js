

const timeStamp = require('../utility/timeStamp');
const logger = require('../utility/logger');

async function save(connection, queryString)
{
    var resultCode = 0;
    
    return new Promise(function(resolve){
        
        connection.query(queryString, function (error) {
                
            if(error) {
                //console.log(`${timeStamp.serverTimeStamp()} | QUERY : ${queryString} | INSERTION ERROR | ${error}`);
                logger.log(`QUERY : ${queryString} INSERTION ERROR | ${error}`);
            }
            else{

                resultCode = 1;
                resolve(resultCode);
            }
        });

    });
}


const dbLib = {
    save : save
}

module.exports = dbLib;
