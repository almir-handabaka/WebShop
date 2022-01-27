var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');

router.get('/', function (req, res, next) {
  res.render('administrator/pocetna', { title: 'Web Shop' });
});



module.exports = router;