var express = require('express');
var router = express.Router();
var date = require('date-and-time');
const { db_funkcije } = require('.././database/index.js');


/*
  /chat, ucitava samo listu poruka sa strane
  /chat/korisnik_id ucitava direktno chat s nekim korisnim

*/


router.get('/', async function (req, res, next) {
  res.render('chat/chat', { title: 'Chat - Web Shop', tip_korisnika: 2 });

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
  Kada klikne nekog korisnika na chatu ucita poruke s njim
*/
router.get('/:korisnik_id', async function (req, res, next) {
  let korisnik_id = req.params.korisnik_id;

  db_funkcije.getPorukeOd(req.korisnik, korisnik_id).then((result) => {
    //console.log(result);
    const room_id = result[0].c_room_id;
    const sagovornik = korisnik_id;
    res.status(200).json({ result, korisnik_id, room_id });
  }).catch((error) => {
    console.log(error);
    res.sendStatus(404);
  });

});




module.exports = router;