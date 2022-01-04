var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var multer = require('multer');
const { db_funkcije } = require('.././database/index.js');

const artikli = [
    {
        naziv: "Apple Iphone 13 Pro",
        kategorija: "Mobiteli",
        cijena: 2150,
    },
    {
        naziv: "Samsung Smart TV",
        kategorija: "Televizori",
        cijena: 2150,
    },
    {
        naziv: "Sony PS5",
        kategorija: "Konzole",
        cijena: 1300,
    },
    {
        naziv: "Apple Airpods",
        kategorija: "Mobiteli",
        cijena: 900,
    },
    {
        naziv: "Haubice velikog dometa",
        kategorija: "Black Market",
        cijena: 25000,
    },
    {
        naziv: "Jabuke",
        kategorija: "Voće",
        cijena: 1.5,
    },
    {
        naziv: "Laptop HP G505",
        kategorija: "Laptopi",
        cijena: 815,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
    },
];

const naziv_trgovine = "Miralkov Kutak";


/* Dashboard za prodavnicu */

router.get('/', function (req, res, next) {
    // podatke o trgovini dodati u neki cookie pri loginu ili u req.trgovina
    db_funkcije.dohvatiArtikle(3).then((result) => {
        //console.log(result);
        res.render('trgovina/trgovina', { title: 'Web Shop - ' + naziv_trgovine, naziv_trgovine: naziv_trgovine, artikli: result });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

/* Ruta za dodavanje artikla */
router.post('/dodaj_artikal', function (req, res, next) {
    console.log("Dodaj");
    var artikal = {
        trgovina_id: 3,
        naziv: req.body.naziv,
        cijena: req.body.cijena,
        kolicina: req.body.kolicina,
        stanje: req.body.stanje,
        kategorija_id: req.body.kategorija,
        lokacija: req.body.lokacija,
        opis: req.body.opis,
    };
    console.log(artikal);

    db_funkcije.dodajArtikal(artikal).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});

router.post('/uredi_artikal', function (req, res, next) {
    console.log("Uredi");
    const now = new Date();
    const ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    var artikal = {
        trgovina_id: 3,
        naziv: req.body.naziv,
        cijena: req.body.cijena,
        kolicina: req.body.kolicina,
        stanje: req.body.stanje,
        kategorija_id: req.body.kategorija,
        lokacija: req.body.lokacija,
        opis: req.body.opis,
        datum_editovanja: ptime,
        id_artikla: req.body.id_artikla,
    };

    db_funkcije.updateArtikal(artikal).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});


/* Ruta za brisanje artikla */
router.post('/delete', function (req, res, next) {
    let id_artikla = req.body.id;
    db_funkcije.izbrisiArtikal(id_artikla).then(() => {
        console.log(`Artikal id ${id_artikla} uspjesno izbrisan`);
    })
    // funkcija koja brise artikal iz tabele
});




/* Trgovina dashboard ruta za narudžbe, sadrzi nove narudzbe koje trgovac prihvaca/odbija
    i sve stare narudzbe
    3 - isporuceno
    4 - otkazano od kupca
    5 - otkazano od trgovca

*/
router.get('/narudzbe', function (req, res, next) {
    let id_artikla = req.body.id;
    const now = new Date();
    const ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    res.render('trgovina/narudzbe', { datum: ptime, narudzbe: narudzbe })
});

/* Postavke trgovine  -  Za svaku trgovinu znamo naziv, kontakt telefon i e-mail, adresu sjedišta i drugih poslovnica (naziv ulice i grad), kategoriju/kategorije usluga i druge podatke.   */

const trgovina = {
    naziv: "Miralkov Kutak",
    kontakt_mob: "062697432",
    email: "almir.handabaka@gmail.com",
    grad: "Sarajevo",
    adresa: "Gornji Velesici do 130",
    sifra: "almir123456",
}

router.get('/postavke', function (req, res, next) {
    let id_artikla = req.body.id;
    const now = new Date();
    const ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    res.render('trgovina/postavke', { datum: ptime, trgovina: trgovina })
});

const upload = multer({ dest: './public/data/uploads/' });
router.post('/profilna', upload.single('avatar'), function (req, res, next) {
    console.log(req.file, req.body);
    res.send("Okej");
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
});

router.get('/kategorije', function (req, res, next) {
    db_funkcije.dohvatiKategorije().then((result) => {
        res.send(result);
    }).catch((error) => {
        console.log("Greska prilikom dohvacanja kategorija!")
        //console.log(error);
        res.sendStatus(404);
    });

});


router.get('/poslovnice', function (req, res, next) {
    db_funkcije.dohvatiLokacijeTrgovine(3).then((result) => {
        res.send(result);
    }).catch((error) => {
        console.log("Greska prilikom dohvacanja poslovnica!")
        console.log(error);
        res.sendStatus(404);
    });

});




module.exports = router;
