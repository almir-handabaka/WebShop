const io = require("socket.io")();
const { db_funkcije } = require(".././routes/database");
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv');

dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;
/*
  NOTIFIKACIJE
  Svaki korisnik dobije svoj custom auth string pri registrovanju profila kojeg cuvamo u db.
  Taj auth string enkriptovan u token ce se stavljati u EJS, slati preko socketa na BE tokom komunikacije i tamo znamo s kim komuniciramo. Token je "soba" kojoj cemo kasnije slati notifikacije. Kada kupac potvrdi narudzbu iz baze izvucemo taj token i posaljemo mu notifikaciju. Token ce biti ekriptovan da spriječimo pokušaje zloupotrebe. Token sadrži id profila, auth string i neke druge informacije. Socket middleware će ga raspakovati svaki put.

  Za komunikaciju direktno sa jednim korisnikom (slanje notifikacije) koristiti samo taj auth token. Za chat izmedju korisnika sa FE se šalje token i id korisnika kome se poruka salje ili koristiti neki ID chata tj sobe za ta dva korisnika.

  Kada se narudzba potvrdi poslati notifikaciju trgovcu ako je online, spasiti notif u bazu (id_notif, tekst notif, notifikacija poslata)
  1. Notifikacije za svaku narudžbu u kojoj se nalazi artikal trgovca;
  2. Notifikacija za nove poruke (broj poruka se samo mijenja)
*/

// middleware za auth socket tokena
io.use((socket, next) => {
  //console.log("User token: ", socket.handshake.query.authToken);
  socket.authToken = socket.handshake.query.authToken;

  socket.korisnik = jwt.verify(socket.authToken, JWT_TOKEN);
  socket.join(socket.authToken); // soba preko koje saljem notifikacije
  console.log(socket.korisnik.id);
  next();
});


io.on('connection', (socket) => {
  console.log("User connected", socket.id);

  const pm = (sid) => {
    console.log("Slanje notifikacije");
    io.to(socket[sid]).emit('pocetak', `Dobr5456465odošao ${socket.id}`);
  }

  // funkcija koja salje notifikaciju
  // import u neki fajl const { notifikacijeSocket } = require('../../sockets');
  // koriscenje notifikacijeSocket.io.pm(testToken);
  // deklaracija io.pm = ...

  io.pm = (sid, poruka) => {
    console.log("Slanje notifikacije");
    io.to(sid).emit('pocetak', poruka);
    console.log("Slanje kraj slanja", sid);
  }

  //io.to(socket.authToken).emit('pocetak', `Dobrodošao ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("Korisnik se diskonektovao!", socket.id);

  });

  socket.on('nova_poruka', (msg) => {
    db_funkcije.sacuvajPoruku(msg, socket.korisnik).then((result) => {
      console.log(result);
      io.to(msg.chat_id).emit('primi_poruku', result);
    }).catch((error) => {
      console.log(error);
    })
  });


});


const socketapi = {
  io: io
};


module.exports = { io: io };