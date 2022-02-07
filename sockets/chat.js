const io = require("socket.io")();


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
  console.log("Socket 1");
  console.log("User token 1: ", socket.handshake.query.authToken);
  socket.authToken = socket.handshake.query.authToken;
  socket.join(socket.authToken);
  next();
});


io.on('connection', (socket) => {
  console.log("User connected 1", socket.id);

  socket.on('novi igrac', (msg) => {
    console.log("Novi igrac: ", msg);
    io.to(socket.id).emit('msg', `Dobrodošao ${msg}`);

    let igrac = {
      ime: msg,
      socket_id: socket.id,
    }
    trenutni_igraci.push(igrac);


  });


});


const socketapi = {
  io: io
};

module.exports = { io: io };