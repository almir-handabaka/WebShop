var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var multer = require('multer');

exports.loginRouter = require('./login');
exports.registerRouter = require('./register');

//module.exports = loginRouter;
//module.exports = registerRouter;


