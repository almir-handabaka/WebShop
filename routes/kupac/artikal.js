var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');


router.get('/', function (req, res, next) {
    db_funkcije.dohvatiArtikle(3).then((result) => {
        //console.log(result);
        console.log(result[0]);
        res.render('kupac/pocetna', { title: 'Web Shop', artikli: result });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });
});





module.exports = router;