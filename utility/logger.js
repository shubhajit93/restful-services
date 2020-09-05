var log4js = require('log4js');
log4js.configure('config/log4js.json');
var logger = log4js.getLogger();

exports.log = function (msg, type) {
    
    if (type == 'info') {
        logger.info(msg);
    }
    else if (type == 'error') {
        logger.error(msg);
    }
    else{
        logger.debug(msg);
    }
};
// var log4js = require('log4js'); // include log4js

// log4js.configure({ // configure to use all types in different files.
//     appenders: [
//         {   type: 'file',
//             filename: "logs/error.log", // specify the path where u want logs folder error.log
//             category: 'error',
//             maxLogSize: 20480,
//             backups: 10
//         },
//         {   type: "file",
//             filename: "logs/info.log", // specify the path where u want logs folder info.log
//             category: 'info',
//             maxLogSize: 20480,
//             backups: 10
//         },
//         {   type: 'file',
//             filename: "logs/debug.log", // specify the path where u want logs folder debug.log
//             category: 'debug',
//             maxLogSize: 20480,
//             backups: 10
//         }
//     ]
// });

// var loggerinfo = log4js.getLogger('info'); // initialize the var to use.
// var loggererror = log4js.getLogger('error'); // initialize the var to use.
// var loggerdebug = log4js.getLogger('debug'); // initialize the var to use.


// exports.log = function (msg, type) {
//     if (type == 'info') {
//         loggerinfo.info(msg);
//     }
//     else if (type == 'error') {
//         loggererror.info(msg);
//     }
//     else{
//         loggerdebug.info(msg);
//     }
// }; 