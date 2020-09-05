var mailController = require('./mailController');
var smsController = require('./smsController');
var notificationController = require('./notificationController');

exports.sendRequest = async function(req, res) {
    

    if(req.body.type == "TEXT")
    {
        smsController.sendSms(req, res);
    }  
    else if(req.body.type == "MAIL")
    {
        mailController.sendMail(req, res);
        
    }
    else if(req.body.type == "NOTIFICATION")
    {
        notificationController.cast(req,res);

    }
    else if(req.body.type == "BOT")
    {
        res.send(response.errors.error503);
    }
    else 
    {
        //console.log("UN-AVAILABLE REQUEST TYPE!");
        res.send(errors.error501);
    }
    
}