var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');



router.get('/narudzbe', async function (req, res, next) {
    try {
        const narudzbe = await db_funkcije.dohvatiSveNarudzbe2(req.korisnik);
        //console.log(narudzbe);
        res.render('kupac/narudzbe', { title: 'Web Shop - Narudzbe', narudzbe: narudzbe });
    } catch (error) {
        console.log("3")
        console.log(error);
        next(error);
    }

});

router.post('/narudzbe/otkazi', function (req, res, next) {
    console.log("poziv");
    const id_narudzbe = req.body.id_narudzbe;
    db_funkcije.otkaziNarudzbu(req.korisnik, id_narudzbe).then((result) => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log("error");
        console.log(error);
        res.sendStatus(404);
    });

});

// ispis sadrzaja korpe
router.get('/korpa', async function (req, res, next) {
    try {
        console.log("2")
        const korpa = await db_funkcije.dohvatiKorpu(req.korisnik);
        console.log(korpa);
        res.render('kupac/korpa', { title: 'Korpa - Web Shop', korpa: korpa });
    } catch (error) {
        console.log("3")
        console.log(error);
        next(error);
    }


});

/* pronadjemo sve podatke o artiku, provjerimo da li je moguce naruciti, ako jeste dodajemo artikal u korpu, posle napisati novu funkciju za dohvacanje artikla
koja nece imati joinove
*/


/*
CREATE OR REPLACE PROCEDURE dodajUKorpu (INT, INT, INT, INT)
LANGUAGE 'plpgsql'

AS $$
    DECLARE
        dostupna_kolicina_artikla int;
    BEGIN
        IF EXISTS (SELECT kolicina FROM artikli WHERE id_artikla =  $1)
        THEN SELECT kolicina FROM artikli WHERE id_artikla =  $1 INTO dostupna_kolicina_artikla;
        ELSE
            RETURN;
        END IF;
        IF NOT EXISTS (SELECT * FROM korpa WHERE ko_artikal_id = $1) AND dostupna_kolicina_artikla >= $3 THEN
            INSERT INTO korpa(ko_artikal_id, ko_id_korisnik, ko_kolicina, ko_cijena)
            VALUES($1,$2,$3,$4);
        ELSIF  dostupna_kolicina_artikla >= $3 THEN
            UPDATE korpa
            SET ko_kolicina = ko_kolicina + $3
            WHERE ko_artikal_id = $1 AND ko_kolicina + $3 <= dostupna_kolicina_artikla;
        end if;
   end $$;

*/
router.post('/korpa/dodaj', async function (req, res, next) {
    try {
        let artikal_id = req.body.id_artikla;
        let narucena_kolicina = req.body.kolicina;
        if (narucena_kolicina === 0) {
            return res.sendStatus(404);
        }


        const result = await db_funkcije.dodajUKorpu({ artikal_id: artikal_id, kolicina: narucena_kolicina }, req.korisnik);

        if (result[0].dodajukorpu === true) {
            console.log(`Kupac ${req.korisnik.email} je dodao artikal ${artikal_id} u korpu!`);
            res.sendStatus(200);
        }
        else {
            console.log("Dodavanje u korpu neuspjesno");
            res.sendStatus(400);
        }

    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
});

router.post('/korpa/izbrisi', function (req, res, next) {
    id_korpe = req.body.id_korpe;
    db_funkcije.izbrisiIzKorpe(id_korpe, req.korisnik).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});


// sve sto je  trenutno u korpi prebacujemo u naruzbe, radimo jednu po jednu narudzbu
// TODO na FE ukloniti artikal, smanjiti broj artikala u korpi
router.post('/korpa/naruci', function (req, res, next) {
    const id_korpe = req.body.id_korpe;
    db_funkcije.potvrdiNarudzbu(req.korisnik, id_korpe).then(() => {
        res.sendStatus(200);
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    })

});


router.get('/:artikal_id', async function (req, res, next) {
    try {
        let artikal_id = req.params.artikal_id;
        let artikal = await db_funkcije.dohvatiArtikal(artikal_id);
        if (artikal[0] === undefined) {
            return res.redirect('/pocetna');
        }

        let ocjene = await db_funkcije.dohvatiOcjene(artikal_id);
        let fotografije = await db_funkcije.dohvatiFotografije(artikal_id);
        let korpa = await db_funkcije.dohvatiKorpu(req.korisnik);

        if (ocjene[0] === undefined) {
            ocjene = { count: '0', avg: '0' };
        } else {
            ocjene = ocjene[0];
            ocjene.avg = Math.round(ocjene.avg * 100) / 100;
        }
        //console.log(artikal);


        res.render('kupac/artikal', { title: artikal[0].naziv_artikla + ' - Web Shop', artikal: artikal[0], ocjene: ocjene, fotografije: fotografije, broj_u_korpi: korpa.length });
    } catch (error) {
        console.log(error);
        next(error);
    }



    // db_funkcije.dohvatiArtikal(artikal_id).then((result) => {
    //     if (result[0] !== undefined) {
    //         artikal = result[0];
    //         return db_funkcije.dohvatiOcjene(artikal_id);
    //     }

    //     else
    //         res.redirect('/pocetna');
    // }).then((ocjene) => {
    //     console.log(artikal);
    //     res.render('kupac/artikal', { title: artikal.naziv_artikla + ' - Web Shop', artikal: artikal, ocjene: ocjene });
    // }).catch((error) => {
    //     console.log(error);
    //     next(error);
    // });

});


module.exports = router;