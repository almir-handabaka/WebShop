var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var multer = require('multer');

var loginRouter = require('./login');
var registerRouter = require('./register');

module.exports = loginRouter;
module.exports = registerRouter;


