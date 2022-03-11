var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');
const { v4: uuidv4 } = require('uuid');
const url = require('url');


/*
  /chat, ucitava samo listu poruka sa strane
  /chat/korisnik_id ucitava direktno chat s nekim korisnim

*/


router.get('/', async function (req, res, next) {
  const url_query = url.parse(req.url, true).query;
  let otvoriChatSa = -1;
  if (Object.keys(url_query).length != 0) {
    otvoriChatSa = url_query.profil;
  }
  res.render('chat/chat', { title: 'Chat - Web Shop', tip_korisnika: 2, otvoriChat: otvoriChatSa });

});

router.get('/aktivnost', async function (req, res, next) {
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

    //console.log(profili);
    res.status(200).json({ profili });
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});



/*
  kad korisnik klikne dugme na profilu "Posalji poruku" u niz poruka se dodaje i id tog profila ukoliko se ne nalazi u njemu

*/

/*
  Kada klikne nekog korisnika na chatu ucita poruke s njim. Ako ne postoji nista sacuvano u tabeli, generise se novi room_id.
*/
router.get('/:korisnik_id', async function (req, res, next) {
  let korisnik_id = req.params.korisnik_id;

  db_funkcije.getPorukeOd(req.korisnik, korisnik_id).then((result) => {
    console.log(result);
    let room_id, sagovornik, prva_poruka;
    if (result.length === 0) {
      room_id = uuidv4();

    } else {
      room_id = result[0].c_room_id;
    }

    sagovornik = korisnik_id;
    res.status(200).json({ result, korisnik_id, room_id });
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});




module.exports = router;