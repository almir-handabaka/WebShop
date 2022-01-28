const io = require("socket.io")();
const socketapi = {
  io: io
};

/*
  Svaki korisnik dobije svoj custom auth string pri registrovanju profila kojeg cuvamo u db.
  Taj auth string enkriptovan u token ce se stavljati u EJS, slati preko socketa na BE tokom komunikacije i tamo znamo s kim komuniciramo. Token ce biti ekriptovan da spriječimo pokušaje zloupotrebe. Token sadrži id profila, auth string i neke druge informacije. Socket middleware će ga raspakovati svaki put.

  Za komunikaciju direktno sa jednim korisnikom (slanje notifikacije) koristiti samo taj auth token. Za chat izmedju korisnika sa FE se šalje token i id korisnika kome se poruka salje ili koristiti neki ID chata tj sobe za ta dva korisnika.

  Kada se narudzba potvrdi poslati notifikaciju trgovcu ako je online, spasiti notif u bazu (id_notif, tekst notif, notifikacija poslata)
  1. Notifikacije za svaku narudžbu u kojoj se nalazi artikal trgovca;
  2. Notifikacija za nove poruke (broj poruka se samo mijenja)
*/



io.on('connection', (socket) => {
  console.log("User connected", socket.id);
  io.to(socket.id).emit('pocetak', `Dobrodošao ${socket.id}`);
  socket.on("disconnect", () => {
    console.log("Korisnik se diskonektovao!", socket.id);

  });

  socket.on('novi igrac', (msg) => {
    console.log("Novi igrac: ", msg);
    io.to(socket.id).emit('msg', `Dobrodošao ${msg}`);

    let igrac = {
      ime: msg,
      socket_id: socket.id,
    }
    trenutni_igraci.push(igrac);

    zapocniIgru(io, socket, msg);
  });


});

console.log("EXPORT")
module.exports = { io: io };