var express = require('express');
var router = express.Router();
const { dozvoljenaRuta } = require('../helpers/helper.js');


/* GET login/register stranicu */
router.get('/', function (req, res, next) {
  res.render('prijava/index', { title: 'Web Shop' });
  //res.render('administrator/test', { title: 'Web Shop' });
});

module.exports = router;
