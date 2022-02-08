var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');
var date = require('date-and-time');

router.get('/', function (req, res, next) {
  //res.render('administrator/pocetna', { title: 'Admin - Web Shop' });
  res.redirect('/admin/korisnici');
});

router.get('/korisnici', function (req, res, next) {
  db_funkcije.dohvatiSveKorisnike().then((korisnici) => {
    console.log(korisnici);
    res.render('administrator/korisnici', { title: 'Korisnici - Web Shop', korisnici: korisnici });
  }).catch((error) => {
    console.log(error);
    next(error);
  });

});

router.post('/blokiraj', function (req, res, next) {
  let novi_status = req.body.novi_status;
  let korisnik_id = req.body.korisnik_id;

  if (novi_status === 3) {
    const now = new Date();
    let ptime = date.format(now, 'YYYY/MM/DD HH:mm:ss');
    var banovan_do = new Date(ptime);
    banovan_do.setDate(result.getDate() + 15);
  } else {
    const now = new Date();
    let banovan_do = date.format(now, 'YYYY/MM/DD HH:mm:ss');
  }

  db_funkcije.promjeniStatusKorisnika(novi_status, korisnik_id, banovan_do).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});


router.post('/poruka', function (req, res, next) {
  let sadrzaj_poruke = req.body.poruka;

  if (sadrzaj_poruke && sadrzaj_poruke.length !== 0) {
    poruka = {};
    poruka.chat_id = -1;
    poruka.tekst_poruke = sadrzaj_poruke;
    // -1 za masovnu poruku
    db_funkcije.sacuvajPoruku(poruka, req.korisnik).then(() => {
      res.sendStatus(200);
    }).catch((error) => {
      console.log(error);
      res.sendStatus(404);
    });
  } else {
    res.sendStatus(404);
  }

});

router.get('/statistika', function (req, res, next) {
  res.render('administrator/statistika', { title: 'Statistika - Web Shop' });
});



router.get('/statistika/1', async function (req, res, next) {
  try {
    const korisnici = await db_funkcije.dohvatiSveKorisnike();
    const broj_korisnika = korisnici.length;
    let trgovci = 0;
    let kupci = 0;
    let admini = 0;
    let aktivni = 0;
    let banovani = 0;
    let mjesecna_aktivnost = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < korisnici.length; i++) {
      if (korisnici[i].tip_korisnika === 1) {
        admini++;
      }
      else if (korisnici[i].tip_korisnika === 2) {
        trgovci++;
      }
      else {
        kupci++;
      }

      if (korisnici[i].status_profila === 1) {
        aktivni++;
      }
      else {
        banovani++;
      }
    }

    const artikli = await db_funkcije.dohvatiArtikle();
    let broj_artikala = artikli.length;
    let artikli_po_kategorijama = {};

    for (let i = 0; i < artikli.length; i++) {
      if (artikli[i].kategorija_id in artikli_po_kategorijama) {
        artikli_po_kategorijama[artikli[i].kategorija_id]++;
      }
      else {
        artikli_po_kategorijama[artikli[i].kategorija_id] = 1;
      }
    }

    const chat_poruke = await db_funkcije.getSvePoruke();
    let broj_poruka = chat_poruke.length;
    let poslao_admin = 0;
    let poslao_trgovac = 0;
    let poslao_kupac = 0;
    for (let i = 0; i < chat_poruke.length; i++) {
      if (chat_poruke[i].tip_korisnika === 1) {
        poslao_admin++;
      }
      else if (chat_poruke[i].tip_korisnika === 2) {
        poslao_trgovac++;
      }
      else {
        poslao_kupac++;
      }
    }

    const narudzbe = await db_funkcije.dohvatiSveNarudzbe();
    const broj_narudzbi = narudzbe.length;
    let totalni_profit = 0;
    let zavrsene_narudzbe = 0;
    let aktivne_narudzbe = 0;
    // 0 poslata, 1 prihvacena, 2 odbijena, 3 isporuceno
    for (let i = 0; i < narudzbe.length; i++) {
      if (narudzbe[i].status_isporuke === 3) {
        zavrsene_narudzbe++;
        totalni_profit += (narudzbe.kolicina * narudzbe.cijena_po_kom);
      }
      else {
        aktivne_narudzbe++;
      }
    }

    //-----------
    /* const broj_korisnika = korisnici.length;
     let trgovci = 0;
     let kupci = 0;
     let admini = 0;
     let aktivni = 0;
     let banovani = 0;
     */

    const data_korisnici = {
      labels: [
        'Admin',
        'Trgovac',
        'Kupac'
      ],
      datasets: [{
        label: 'Korisnici',
        data: [admini, trgovci, kupci],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };

    const config_korisnik = {
      type: 'doughnut',
      data: data_korisnici,
    };

    const data_aktivnost = {
      labels: [
        'Banovani',
        'Aktivni',
      ],
      datasets: [{
        label: 'Aktivnost korisnika',
        data: [banovani, aktivni],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',

        ],
        hoverOffset: 4
      }]
    };

    const config_aktivnost = {
      type: 'doughnut',
      data: data_aktivnost,
    };

    /*
      let totalni_profit = 0;
      let zavrsene_narudzbe = 0;
      let aktivne_narudzbe = 0;
    
    */

    const data_narudzbe = {
      labels: [
        'Završeno',
        'U toku',
      ],
      datasets: [{
        label: 'Narudzbe',
        data: [zavrsene_narudzbe, aktivne_narudzbe],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
        ],
        hoverOffset: 4
      }]
    };

    const config_narudzbe = {
      type: 'doughnut',
      data: data_narudzbe,
    };



    res.status(200).json({ config_korisnik, config_aktivnost, config_narudzbe });

  } catch (error) {
    console.log(error);
    res.sendStatus(404);
  }


});

// CRUD lookup tabela (gradovi, glavne kategorije, )
router.get('/lookup', function (req, res, next) {
  let kategorije;
  db_funkcije.dohvatiKategorije().then((result) => {
    kategorije = result;
    return db_funkcije.dohvatiGradoveIKantone();

  }).then((gradovi) => {
    console.log(gradovi[0].rows);
    kanton = {};
    for (let i = 0; i < gradovi[0].rows.length; i++) {
      kanton[gradovi[0].rows[i].id_kantona] = gradovi[0].rows[i].naziv_kantona;
    }
    console.log(kanton);
    res.render('administrator/lookup', {
      title: 'Lookup - Web Shop', kategorije: kategorije, grad: gradovi[1].rows, kanton: kanton
    });
  }).catch((error) => {
    console.log(error);
    next(error);
  });

});

router.post('/lookup/nova_kategorija', function (req, res, next) {
  let nova_kategorija = req.body.novaKategorija;
  console.log(nova_kategorija);
  db_funkcije.dodajKategoriju(nova_kategorija).then((result) => {
    res.status(200).json(result[0]);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });


});


router.post('/lookup/ukloni_kategoriju', function (req, res, next) {
  let id_kategorije = req.body.id_kategorije;
  console.log("Brisanje kategorije")
  db_funkcije.izbrisiKategoriju(id_kategorije).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });


});

module.exports = router;