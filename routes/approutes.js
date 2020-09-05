const express = require('express');
const router = express.Router();

var smsController = require('../controller/operator/sendSms');
var provisionController = require('../controller/operator/purchaseOrder');
var requestController = require('../controller/requestController');
var msgController = require('../controller/msgController');
var notificationController = require('../controller/notificationController');


router.route('/operator/sms/send')
    .get(smsController.sendsms);

router.route('/operator/data/provision')
    .get(provisionController.dataProvision);

router.route('/message/endpoint')
    .post(requestController.sendRequest);

router.route('/message/send')
    .post(msgController.send);

router.route('/pushnotification/send/token')
    .post(notificationController.saveToken);


module.exports = router;

