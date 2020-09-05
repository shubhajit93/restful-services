
const config = require('./config/config');
const express = require('express');
const bodyParser = require("body-parser");
const mysql = require("mysql");
const appRoutes = require('./routes/approutes');
const login = require('./controller/operator/login');
const startUp = require('./controller/startUpController');
global.response = require('./utility/response.json');
//console.log(global.response);


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = config.appInfo.port || 3000;
const ip = config.appInfo.ip || 'localhost';


global.pool = mysql.createPool(config.mysqlDB);


global.smsAccessToken = '' 
global.smsRefreshtoken = ''
global.dppAccessToken = '' 
global.dppRefreshtoken = ''

app.use('/', appRoutes);

startUp(login, app, port, ip);

module.exports = app;