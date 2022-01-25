var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');


router.get('/', function (req, res, next) {
    if (req.cookies.firstLogin === "true") {
        req.cookies.firstLogin = true;
    }
    else {
        req.cookies.firstLogin = false;
    }
    db_funkcije.dohvatiArtikle(3).then((result) => {
        //console.log(result);
        //console.log(result[0]);
        res.render('kupac/pocetna', { title: 'Web Shop', artikli: result, first_login: req.cookies.firstLogin });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });
});

router.get('/kategorije', function (req, res, next) {
    db_funkcije.dohvatiKategorije().then((result) => {
        res.render('kupac/kategorije', { title: 'Web Shop', kategorije: result });
    }).catch((error) => {
        console.log(error);
        next(error);
    });
});

router.get('/kategorije/:id_kategorije', function (req, res, next) {
    let id_kategorije = req.params.id_kategorije;

    db_funkcije.pretraziPoKategoriji(id_kategorije).then((result) => {
        //console.log(result);
        res.render('kupac/pocetna', { title: 'Web Shop', artikli: result });
    }).catch((error) => {
        console.log(error);
        next(error);
    });
});

router.get('/trgovine', function (req, res, next) {
    db_funkcije.dohvatiSveTrgovine().then((result) => {
        console.log(result);
        res.render('kupac/trgovine', { title: 'Web Shop', trgovine: result });
    }).catch((error) => {
        console.log(error);
        next(error);
    });
});


// artikli
// podatke o trgovini
router.get('/trgovine/:id_trgovine', async function (req, res, next) {
    let id_trgovine = req.params.id_trgovine;
    try {
        let artikli = await db_funkcije.dohvatiArtikle(id_trgovine);
        let trgovina = await db_funkcije.dohvatiPodatkeOTrgovini(id_trgovine);
        console.log(trgovina);
        res.render('kupac/trgovina', { title: 'Web Shop', trgovina: trgovina, artikli: artikli });

    } catch (error) {
        console.log(error);
        next(error);
    }

});

router.post('/interesi', async function (req, res, next) {
    let interesi = JSON.parse(req.body.tagovi);
    console.log(interesi);
    try {
        const inte = await db_funkcije.dodajInterese(interesi, req.korisnik);
        const fl = await db_funkcije.promjeniFirstLogin(req.korisnik);
        req.cookies.firstLogin
        res.clearCookie("firstLogin");
        res.cookie('firstLogin', false);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        next(error);
    }

});



module.exports = router;