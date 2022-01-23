var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');

/*
  {
    id_artikla: 103,
    trgovina_id: 3,
    kategorija_id: 1,
    podkategorija_id: null,
    naziv_artikla: 'padni bazo #3',
    opis_artikla: 'padni bazo #3',
    lokacija: 1,
    stanje: 1,
    cijena: 232323,
    kolicina: 1,
    datum_kreiranja: 2022-01-14T22:59:07.498Z,
    zadnja_promjena: 2022-01-14T22:59:07.498Z
  }

*/


// fotografije
// podatke o artiklu i lokaciji i trgovini - artikal
// broj ocjena, prosjecna ocjena - ocjene
router.get('/:artikal_id', async function (req, res, next) {
    try {
        let artikal_id = req.params.artikal_id;
        let artikal = await db_funkcije.dohvatiArtikal(artikal_id);
        if (artikal[0] === undefined) {
            return res.redirect('/pocetna');
        }

        let ocjene = await db_funkcije.dohvatiOcjene(artikal_id);
        let fotografije = await db_funkcije.dohvatiFotografije(artikal_id);

        if (ocjene[0] === undefined) {
            ocjene = { count: '0', avg: '0' };
        } else {
            ocjene = ocjene[0];
            ocjene.avg = Math.round(ocjene.avg * 100) / 100;
        }
        console.log(artikal);


        res.render('kupac/artikal', { title: artikal[0].naziv_artikla + ' - Web Shop', artikal: artikal[0], ocjene: ocjene, fotografije: fotografije });
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