var express = require('express');
var router = express.Router();
var date = require('date-and-time');
var multer = require('multer');
const { db_funkcije } = require('.././database/index.js');
var path = require('path');

//const { notifikacijeSocket } = require('../../sockets');


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



/* Dashboard za prodavnicu */

router.get('/', function (req, res, next) {
    // podatke o trgovini dodati u neki cookie pri loginu ili u req.trgovina
    db_funkcije.dohvatiArtikle(3).then((result) => {
        //console.log(result);
        res.render('trgovina/trgovina', { title: 'Web Shop - ' + "Miralkov Kutak", naziv_trgovine: "Miralkov Kutak", artikli: result });
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });

});


/* Ruta za dodavanje artikla */
router.post('/dodaj_artikal', /*upload.array("file", 12)*/ upload.any(), async function (req, res, next) {
    console.log("Dodavanje artikla sa slikama");

    var artikal = {
        trgovina_id: 3,
        naziv: req.body.naziv,
        cijena: req.body.cijena,
        kolicina: req.body.kolicina,
        stanje: req.body.stanje,
        kategorija_id: req.body.kategorija,
        lokacija: req.body.lokacija,
        opis: req.body.opis,
        tagovi: JSON.parse(req.body.tagovi),
    };

    console.log("Duzina", artikal.tagovi.length)
    let tagovi = await db_funkcije.dodajTagove(artikal.tagovi, 1000);
    return res.sendStatus(200);
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




router.get('/narudzbe', function (req, res, next) {

    const now = new Date();
    const ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    res.render('trgovina/narudzbe', { datum: ptime, narudzbe: narudzbe })
});


router.get('/postavke', async function (req, res, next) {

    const result = await db_funkcije.dohvatiPodatkeOTrgovini(3);
    const gradIKanton = await db_funkcije.dohvatiGradoveIKantone();
    const kanton = gradIKanton[0].rows;
    const grad = gradIKanton[1].rows;
    console.log(result);

    res.render('trgovina/postavke', { data: result, kanton: kanton, grad: grad, title: "Postavke - Web Shop" });


});


//const upload = multer({ dest: './public/data/uploads/' });
router.post('/profilna', upload.single('avatar'), function (req, res, next) {

    db_funkcije.sacuvajProfilnu(req.korisnik.email, req.fotografije).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })




});

router.get('/kategorije', function (req, res, next) {

    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsImltZSI6IkFsbWlyIiwicHJlemltZSI6IkhhbmRhYmFrYSIsInRpcCI6MiwiZW1haWwiOiJhbG1pci5hQGdtYWlsLmJhIiwiZmlyc3RfbG9naW4iOmZhbHNlLCJpYXQiOjE2NDM0MTE1OTQsImV4cCI6MTY0NjAwMzU5NH0.jZBuu-xKgUrO0gs485Y6ZA-io61zXNgFouL3IaDkqGk";

    try {
        //notifikacijeSocket.io.pm(testToken, "Pozdrav trgovac, nadam se da sve radi!");

    } catch (error) {
        console.log(error);
    }


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
        res.render('trgovina/evidencija_narudzbi', { artikli: result, title: "Evidencija narud??bi" });
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

    db_funkcije.dodajPoslovnicu(poslovnica, req.trgovina_id).then((result) => {
        res.status(200).json(result[0]);
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
