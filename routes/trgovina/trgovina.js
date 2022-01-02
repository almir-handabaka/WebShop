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
    res.render('trgovina/trgovina', { title: 'Web Shop - ' + naziv_trgovine, naziv_trgovine: naziv_trgovine, artikli: artikli });
});

/* Ruta za brisanje artikla */
router.post('/delete', function (req, res, next) {
    let id_artikla = req.body.id;
    // funkcija koja brise artikal iz tabele
});


const narudzbe = [
    {
        naziv: "Apple Iphone 13 Pro",
        cijena: 2150,
        kolicina: 1,
        status: 1,
    },
    {
        naziv: "Samsung Smart TV",
        kategorija: "Televizori",
        cijena: 2150,
        kolicina: 1,
        status: 1,
    },
    {
        naziv: "Sony PS5",
        kategorija: "Konzole",
        cijena: 1300,
        kolicina: 2,
        status: 1,
    },
    {
        naziv: "Apple Airpods",
        kategorija: "Mobiteli",
        cijena: 900,
        kolicina: 5,
        status: 1,
    },
    {
        naziv: "Haubice velikog dometa",
        kategorija: "Black Market",
        cijena: 25000,
        kolicina: 1,
        status: 1,
    },
    {
        naziv: "Jabuke",
        kategorija: "Voće",
        cijena: 1.5,
        kolicina: 9,
        status: 1,
    },
    {
        naziv: "Laptop HP G505",
        kategorija: "Laptopi",
        cijena: 815,
        kolicina: 2,
        status: 1,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
        kolicina: 25,
        status: 1,
    },
    {
        naziv: "Haubice velikog dometa",
        kategorija: "Black Market",
        cijena: 25000,
        kolicina: 1,
        status: 2,
    },
    {
        naziv: "Jabuke",
        kategorija: "Voće",
        cijena: 1.5,
        kolicina: 10,
        status: 2,
    },
    {
        naziv: "Laptop HP G505",
        kategorija: "Laptopi",
        cijena: 815,
        kolicina: 2,
        status: 2,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
        kolicina: 25,
        status: 2,
    },
    {
        naziv: "Haubice velikog dometa",
        kategorija: "Black Market",
        cijena: 25000,
        kolicina: 1,
        status: 3,
    },
    {
        naziv: "Jabuke",
        kategorija: "Voće",
        cijena: 1.5,
        kolicina: 10,
        status: 3,
    },
    {
        naziv: "Laptop HP G505",
        kategorija: "Laptopi",
        cijena: 815,
        kolicina: 2,
        status: 3,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
        kolicina: 25,
        status: 3,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
        kolicina: 25,
        status: 4,
    },
    {
        naziv: "RTX 3060",
        kategorija: "Grafičke kartice",
        cijena: 1450,
        kolicina: 25,
        status: 5,
    },
];

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



module.exports = router;
