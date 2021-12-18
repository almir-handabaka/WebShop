var express = require('express');
var router = express.Router();

/* GET login/register stranicu */
router.get('/', function (req, res, next) {
  res.render('prijava/index', { title: 'Web Shop' });
  //res.render('administrator/test', { title: 'Web Shop' });
});

module.exports = router;
