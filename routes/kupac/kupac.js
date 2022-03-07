var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const url = require('url');
const { db_funkcije } = require('.././database/index.js');


router.get('/', function (req, res, next) {
    if (req.cookies.firstLogin === "true") {
        req.cookies.firstLogin = true;
    }
    else {
        req.cookies.firstLogin = false;
    }
    db_funkcije.dohvatiArtikle().then((result) => {
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
        const interes_tmp = await db_funkcije.dodajInterese(interesi, req.korisnik);
        console.log("Interesi id ", interes_tmp);
        if (req.cookies.firstLogin === "true") {
            const fl = await db_funkcije.promjeniFirstLogin(req.korisnik);
            res.clearCookie("firstLogin");
            res.cookie('firstLogin', false);
            res.status(200).json(interes_tmp);

        } else {
            res.status(200).json(interes_tmp);
        }
    } catch (error) {
        console.log(error);
        //next(error);
        res.sendStatus(404);
    }

});

router.get('/postavke', async function (req, res, next) {
    try {
        const korisnik_data = await db_funkcije.dohvatiSveOKorisniku(req.korisnik);
        console.log(korisnik_data);
        res.render('kupac/postavke', { title: 'Web Shop', korisnik: korisnik_data });
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.post('/postavke/detalji', function (req, res, next) {
    let broj_mobitela = req.body.kontakt_telefon;
    db_funkcije.promjeniBrojKorisnika(broj_mobitela, req.korisnik.email).then(() => {
        console.log("Korisnik detalji uspjesno promjenjeni!");
        res.sendStatus(200);
    }).catch((error) => {
        res.sendStatus(404);
    });
});


router.post('/interesi/delete', function (req, res, next) {
    let interes_id = req.body.interes_id;
    db_funkcije.izbrisiInteres(interes_id, req.korisnik).then(() => {
        console.log("Interes uspjesno izbrisan!");
        res.sendStatus(200);
    }).catch((error) => {
        res.sendStatus(404);
    });
});


router.get('/pretraga', function (req, res, next) {
    const query_str = url.parse(req.url, true).query;
    const search_input = query_str.search_input;
    console.log(search_input);

    db_funkcije.searchArtiklePoTekstu(search_input).then((result) => {
        res.render('kupac/pocetna', { title: 'Web Shop', artikli: result, first_login: req.cookies.firstLogin });
    }).catch((error) => {
        console.log("Greska pri pretrazi!");
        console.log(error);
        res.sendStatus(404);
    });
});


module.exports = router;