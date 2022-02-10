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

var numDaysBetween = function (d1, d2) {
  var diff = Math.abs(d1.getTime() - d2.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


router.get('/statistika/1', async function (req, res, next) {
  try {
    const korisnici = await db_funkcije.dohvatiSveKorisnike();
    const broj_korisnika = korisnici.length;
    let trgovci = 0;
    let kupci = 0;
    let admini = 0;
    let aktivni = 0;
    let banovani = 0;
    let reg_zadnjih_30_dana = {};

    const now = new Date();
    //console.log(now);
    for (let i = 0; i < 30; i++) {
      let tmp_date = date.addDays(now, -i);
      reg_zadnjih_30_dana[date.format(tmp_date, 'YYYY/MM/DD')] = Math.round(Math.random() * 50);
    }


    for (let i = 0; i < korisnici.length; i++) {
      let registracija = numDaysBetween(now, korisnici[i].datum_registracije);
      if (registracija <= 30) {


        //registracija = Math.round(registracija);
        //reg_zadnjih_30_dana[date.addDays(now, -registracija)] += 1;
        reg_zadnjih_30_dana[date.format(date.addDays(now, -registracija), 'YYYY/MM/DD')] += 1;;

      }

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

    //console.log("Zadnjih 30 dana", reg_zadnjih_30_dana)
    let registracije_labels = [];
    let registracije_data = [];

    for (const i in reg_zadnjih_30_dana) {
      //console.log(i);
      registracije_labels.push(i);
      registracije_data.push(reg_zadnjih_30_dana[i]);
    }

    //console.log(registracije_labels);
    //console.log(registracije_data);

    const artikli = await db_funkcije.dohvatiArtikle();
    const kategorije = await db_funkcije.dohvatiKategorije();

    let artikli_po_kategorijama = {};
    for (let i = 0; i < kategorije.length; i++) {
      artikli_po_kategorijama[kategorije[i].id_kategorije] = {
        naziv_kategorije: kategorije[i].naziv_kategorije,
        kolicina: Math.round(Math.random() * 150),
      };
    }

    for (let i = 0; i < artikli.length; i++) {
      if (artikli[i].kategorija_id in artikli_po_kategorijama) {
        artikli_po_kategorijama[artikli[i].kategorija_id].kolicina++;
      }
    }

    let kat_data = [];
    let kat_labels = [];
    for (const i in artikli_po_kategorijama) {
      kat_data.push(artikli_po_kategorijama[i].kolicina);
      kat_labels.push(artikli_po_kategorijama[i].naziv_kategorije);
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
    let totalni_profit = 0;
    let zavrsene_narudzbe = 0;
    let aktivne_narudzbe = 0;
    let odbijena_narudzbe = 0;

    // 0 poslata, 1 prihvacena, 2 odbijena, 3 isporuceno
    for (let i = 0; i < narudzbe.length; i++) {
      if (narudzbe[i].status_isporuke === 3) {
        zavrsene_narudzbe++;
        totalni_profit += (narudzbe.kolicina * narudzbe.cijena_po_kom);
      }
      else if (narudzbe[i].status_isporuke === 2) {
        odbijena_narudzbe++;
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
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Korisnici',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
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
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Aktivnost korisnika',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
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
        'Otkazane/odbijene',
      ],
      datasets: [{
        label: 'Narudzbe',
        data: [zavrsene_narudzbe, aktivne_narudzbe, odbijena_narudzbe],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgba(255, 205, 86)',
        ],
        hoverOffset: 4
      }]
    };

    const config_narudzbe = {
      type: 'doughnut',
      data: data_narudzbe,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Narudžbe',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
    };


    /*
        let poslao_admin = 0;
        let poslao_trgovac = 0;
        let poslao_kupac = 0;
    
    */
    const data_chat = {
      labels: [
        'Admin',
        'Trgovac',
        'Kupac',
      ],
      datasets: [{
        label: 'Narudzbe',
        data: [poslao_admin, poslao_trgovac, poslao_kupac],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgba(255, 205, 86)',
        ],
        hoverOffset: 4
      }]
    };
    const config_chat = {
      type: 'doughnut',
      data: data_chat,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Chat',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
    };

    //-------------------------------

    /*
        let registracije_labels = [];
        let registracije_data = [];
    */


    const data_registracije = {
      labels: registracije_labels,
      datasets: [{
        label: 'Registracije',
        data: registracije_data,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      }]
    };

    const config_registracije = {
      type: 'line',
      data: data_registracije,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Registracije u zadnjih 30 dana',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
    };

    //--------------------

    /*
      let kat_data = [];
      let kat_labels = [];
      
    */

    let backColors = [];
    for (let i = 0; i < kat_labels.length; i++) {
      backColors.push(getRandomColor());
    }

    const data_kategorije = {
      labels: kat_labels,
      datasets: [{
        label: 'Kategorije',
        data: kat_data,
        backgroundColor: backColors,
        hoverOffset: 4
      }]
    };

    const config_kategorije = {
      type: 'pie',
      data: data_kategorije,
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              // This more specific font property overrides the global property
              font: {
                size: 25
              }
            }
          },
          title: {
            display: true,
            text: 'Artikli po kategorijama',
            fullSize: true,
            font: {
              size: 30
            }
          },
          tooltip: {
            titleFont: {
              size: 20
            },
            bodyFont: {
              size: 20
            },
            footerFont: {
              size: 20 // there is no footer by default
            }
          }
        }
      }
    };



    res.status(200).json({ config_korisnik, config_aktivnost, config_narudzbe, admini, trgovci, kupci, aktivni, banovani, zavrsene_narudzbe, aktivne_narudzbe, odbijena_narudzbe, config_chat, poslao_admin, poslao_trgovac, poslao_kupac, config_registracije, registracije_labels, registracije_data, config_kategorije, kat_data, kat_labels });

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
      title: 'Lookup - Web Shop', kategorije: kategorije, grad: gradovi[1].rows, kanton: kanton,
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

router.post('/lookup/dodaj_grad', function (req, res, next) {
  let naziv_grada = req.body.naziv_grada;
  let kanton_id = req.body.kanton;

  console.log("Dodavanje grada")
  db_funkcije.dodajGrad(naziv_grada, kanton_id).then((result) => {
    res.status(200).json(result[0]);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });
});

router.post('/lookup/ukloni_grad', function (req, res, next) {
  let id_grada = req.body.id_grada;
  console.log("Brisanje grada")
  db_funkcije.izbrisiGrad(id_grada).then(() => {
    res.sendStatus(200);
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});

module.exports = router;