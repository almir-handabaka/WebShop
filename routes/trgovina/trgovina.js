var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var multer = require('multer');
const { db_funkcije } = require('.././database/index.js');
var path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/data/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueSuffix);
        if (req.fotografije === undefined) {
            req.fotografije = [];
        }
        req.fotografije.push(uniqueSuffix);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') {
            console.log("Nije slika");
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits: {
        fileSize: 1024 * 1024
    },
});



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
    });

});


/* Ruta za dodavanje artikla */
router.post('/dodaj_artikal', /*upload.array("file", 12)*/ upload.any(), function (req, res, next) {
    console.log("Dodavanje artikla sa slikama");
    console.log(req.fotografije);
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
    //console.log(artikal);

    db_funkcije.dodajArtikal(artikal).then((id_artikla) => {
        if (req.fotografije != undefined)
            return db_funkcije.sacuvajFotografije(req.fotografije, id_artikla);
    }).then(() => {
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
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});




/* Trgovina dashboard ruta za narudžbe, sadrzi nove narudzbe koje trgovac prihvaca/odbija
    i sve stare narudzbe
    3 - isporuceno
    4 - otkazano od kupca
    5 - otkazano od trgovca

*/
router.get('/narudzbe', function (req, res, next) {

    const now = new Date();
    const ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    res.render('trgovina/narudzbe', { datum: ptime, narudzbe: narudzbe })
});

/* Postavke trgovine  -  Za svaku trgovinu znamo naziv, kontakt telefon i e-mail, adresu sjedišta i drugih poslovnica (naziv ulice i grad), kategoriju/kategorije usluga i druge podatke.   */



router.get('/postavke', async function (req, res, next) {

    const result = await db_funkcije.dohvatiPodatkeOTrgovini(3);
    const gradIKanton = await db_funkcije.dohvatiGradoveIKantone();
    const kanton = gradIKanton[0].rows;
    const grad = gradIKanton[1].rows;
    console.log(result);

    res.render('trgovina/postavke', { data: result, kanton: kanton, grad: grad, title: "Postavke - Web Shop" });




    // db_funkcije.dohvatiPodatkeOTrgovini(3).then((result) => {
    //     for (let i = 0; i < result.length; i++)
    //         result[i].password_hash = "";

    //     console.log(result);
    //     res.render('trgovina/postavke', { data: result, title: "Postavke" });
    // }).catch((error) => {
    //     console.log(error);
    //     res.sendStatus(404);
    // });



});


//const upload = multer({ dest: './public/data/uploads/' });
router.post('/profilna', upload.single('avatar'), function (req, res, next) {

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

router.get('/fotografije/:id_artikla', function (req, res, next) {
    let id_artikla = req.params.id_artikla;
    db_funkcije.dohvatiFotografije(id_artikla).then((result) => {
        res.json(result);
        //console.log(result);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

router.post('/fotografija/delete', function (req, res, next) {
    let foto_id = req.body.foto_id;

    db_funkcije.izbrisiFotografiju(foto_id).then(() => {
        console.log("Fotografija izbrisana!");
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

// 0 poslata, 1 prihvacena, 2 odbijena, 3 isporuceno
router.get('/narudzbe/aktivne', function (req, res, next) {
    db_funkcije.dohvatiAktivneNarudzbe(3).then((result) => {
        //console.log(result);
        res.render('trgovina/aktivne_narudzbe', { artikli: result, title: "Aktivne narudzbe" });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});


router.get('/narudzbe/evidencija', function (req, res, next) {
    db_funkcije.dohvatiSveNarudzbe(3).then((result) => {
        res.render('trgovina/evidencija_narudzbi', { artikli: result, title: "Evidencija narudžbi" });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});


router.post('/narudzbe/prihvati', function (req, res, next) {
    let id_narudzbe = req.body.id_narudzbe;
    req.trgovina_id = 3;
    db_funkcije.promjeniStatusNarudzbe(id_narudzbe, 1, req.trgovina_id).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

router.post('/narudzbe/odbij', function (req, res, next) {
    let id_narudzbe = req.body.id_narudzbe;
    req.trgovina_id = 3;
    db_funkcije.promjeniStatusNarudzbe(id_narudzbe, 2, req.trgovina_id).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

router.post('/narudzbe/isporuceno', function (req, res, next) {
    let id_narudzbe = req.body.id_narudzbe;
    req.trgovina_id = 3;
    db_funkcije.promjeniStatusNarudzbe(id_narudzbe, 3, req.trgovina_id).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});

router.post('/postavke/detalji', function (req, res, next) {
    let detalji = JSON.parse(req.body.detalji);
    console.log(detalji);
    req.trgovina_id = 3;

    db_funkcije.promjeniDetaljeTrgovine(detalji, req.trgovina_id).then(db_funkcije.promjeniBrojKorisnika(detalji.kontakt_telefon, "almir.a@gmail.ba").then(() => {
        res.sendStatus(200);
    })).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })



});

router.post('/postavke/poslovnica', function (req, res, next) {
    let poslovnica = JSON.parse(req.body.poslovnica);
    req.trgovina_id = 3;

    db_funkcije.dodajPoslovnicu(poslovnica, req.trgovina_id).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })
});

router.post('/postavke/poslovnica/delete', function (req, res, next) {
    let id_poslovnice = req.body.id_poslovnice;
    req.trgovina_id = 3;

    db_funkcije.ukloniPoslovnicu(id_poslovnice, req.trgovina_id).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })
});


module.exports = router;
