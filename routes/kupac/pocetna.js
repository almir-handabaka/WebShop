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


router.get('/artikal/:artikal_id', function (req, res, next) {
    let artikal_id = req.params.artikal_id;

    db_funkcije.dohvatiArtikal(artikal_id).then((result) => {
        //console.log(result);
        if (result[0] != undefined)
            res.render('kupac/artikal', { title: result[0].naziv_artikla + ' - Web Shop', artikal: result[0] });
        else
            res.redirect('/pocetna');
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });
});



module.exports = router;