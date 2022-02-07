var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');


/*
  /chat, ucitava samo listu poruka sa strane
  /chat/korisnik_id ucitava direktno chat s nekim korisnim

*/


router.get('/', async function (req, res, next) {
  // samo s kim je korisnik komunicirao (postoji makar 1 poruka izmedju korisnika)

  db_funkcije.getAktivnostPoruka(req.korisnik).then((result) => {
    let profili = [];

    for (let i = 0; i < result.length; i++) {
      let postoji = false;
      for (let j = 0; j < profili.length; j++) {
        if (profili[j].id === result[i].id) {
          postoji = true;
          break;
        }
      }
      if (!postoji) {
        profili.push(result[i]);
      }
    }

    console.log(profili);
    res.render('chat/chat', { title: 'Chat - Web Shop', profili: profili });
  }).catch((error) => {
    next(error);
  });

});

/*
  kada korisnik pritisne posalji poruku dodaje se prazna poruka u tabelu
  pa onda ucitamo stranicu iznad koja proslijedi varijablu id chata kojem saljemo poruku

*/
router.get('/:korisnik_id', async function (req, res, next) {
  let korisnik_id = req.params.korisnik_id;

  db_funkcije.getPorukeOd(req.korisnik, korisnik_id).then((result) => {
    res.status(200).json({ result, korisnik_id });
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});




module.exports = router;