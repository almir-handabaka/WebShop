var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');

router.get('/', function (req, res, next) {
    db_funkcije.dohvatiArtikle(3).then((result) => {
        console.log(result);
        res.render('kupac/pocetna', { title: 'Web Shop', artikli: result });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });


});

router.get('/artikal/:naziv/:artikal_id', function (req, res, next) {
    let artikal_id = req.params.artikal_id;

    db_funkcije.dohvatiArtikal(artikal_id).then((result) => {
        console.log(result);
        res.render('kupac/artikal', { title: 'Web Shop', artikal: result });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });


});



module.exports = router;