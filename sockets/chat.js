const io = require("socket.io")();
const { db_funkcije } = require('../routes/database/index.js');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');

dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;


/*
  Tabela se sastoji od c_id,	c_od,	c_ka,	tekst_poruke,	vrijeme_slanja	poruka_vidjena,	globalna_poruka, c_room_id


  Za chat izmedju svakog korisnika u bazi se cuva id sobe koja ce biti neki string.

  Kada korisnik ucita cijeli chat ruta /chat, za svaki chat s nekom osobom bice dodan u svaki od tih soba. 

  Kad ucita poruke s nekim korisnikom u JSU sacuvamo id sobe kako bi znali kome saljemo poruke.

*/

// middleware za auth socket tokena
io.use((socket, next) => {
  console.log("User token 1: ", socket.handshake.query.authToken);
  socket.authToken = socket.handshake.query.authToken;
  try {
    let decoded_token = jwt.verify(socket.authToken, JWT_TOKEN);

    socket.korisnik_id = decoded_token.id;
    console.log(decoded_token)
  } catch (error) {
    console.log("Greska");
    console.log(error);
  }
  next();
});


io.on('connection', (socket) => {
  console.log("User connected on chat socket", socket.id);

  socket.on('dodajUSobu', (room_id) => {
    console.log(`Korisnik ulazi u sobu ${room_id}`);
    socket.join(room_id);
  });

  // spasavamo poruku u db i proslijedimo je drugom korisniku u sobi
  socket.on('nova_poruka', (poruka) => {
    console.log(poruka);
    console.log(socket.korisnik_id);
    poruka.chat_id = poruka.sagovornik;
    db_funkcije.sacuvajPoruku(poruka, socket.korisnik_id).then((result) => {
      socket.to(poruka.room_id).emit('primi_poruku', poruka);
    });

  });
});


const socketapi = {
  io: io
};

module.exports = { io: io };