var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');

//const { sendMail } = require('./mailer');




const { loginRouter, registerRouter } = require('./routes/auth');
const { pocetna_stranica, artikal } = require('./routes/kupac');
const { administrator } = require('./routes/administrator');
const chat = require('./routes/chat');

var indexRouter = require('./routes/prijava');
//var naslovnaRouter = require('./routes/naslovna');
var trgovinaRouter = require('./routes/trgovina');
var authRouter = require('./routes/auth');

var app = express();
// komentar
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
//app.use('/naslovna', naslovnaRouter);
app.use('/trgovina', trgovinaRouter);
app.use('/pocetna', pocetna_stranica);
app.use('/artikal', artikal);
app.use('/admin', administrator);
app.use('/chat', chat);

*/


const rute_dostupne_svima = ['/', '/login', '/login/logout', '/register/user', '/register/trgovina', '/chat', '/register/promjena_sifre'];
const kupac_rute = ['/pocetna', '/pocetna/interesi', '/trgovina', '/artikal', '/artikal/korpa', '/pocetna/kategorije', '/pocetna/postavke', '/artikal/korpa/dodaj', '/pocetna/trgovine', '/pocetna/interesi', '/pocetna/postavke/detalji', '/pocetna/interesi/delete', '/chat',];

const trgovac_rute = ['/trgovina', '/trgovina/delete', '/trgovina/narudzbe', '/trgovina/postavke', '/trgovina/profilna', '/trgovina/dodaj_artikal', '/trgovina/uredi_artikal', '/trgovina/delete', '/trgovina/narudzbe', '/trgovina/profilna', '/trgovina/kategorije', '/trgovina/poslovnice', '/trgovina/fotografije/delete', '/trgovina/narudzbe/aktivne', '/trgovina/narudzbe/evidencija', '/trgovina/narudzbe/prihvati', '/trgovina/narudzbe/odbij', '/trgovina/narudzbe/isporuceno', '/trgovina/postavke/detalji', '/trgovina/postavke/poslovnica', '/trgovina/postavke/poslovnica/delete', '/chat'];

const admin_rute = ['/admin', '/admin/korisnici', '/admin/blokiraj', '/admin/poruka', '/admin/statistika', '/admin/statistika/1', '/chat', '/pocetna/postavke', '/admin/lookup', '/admin/lookup/nova_kategorija', '/admin/lookup/ukloni_kategoriju', '/admin/lookup/dodaj_grad', '/admin/lookup/ukloni_grad'];


const dozvoljenaRuta = (ruta, tip_korisnika) => {
  ruta = ruta.split('/')[0];
  if (tip_korisnika === 1) {
    for (let i = 0; i < admin_rute.length; i++) {

      if (admin_rute[i].includes(ruta)) {
        return true;
      }
    }
  }
  else if (tip_korisnika === 2) {
    for (let i = 0; i < trgovac_rute.length; i++) {

      if (trgovac_rute[i].includes(ruta)) {
        return true;
      }
    }
  }
  else if (tip_korisnika === 3) {
    for (let i = 0; i < kupac_rute.length; i++) {

      if (kupac_rute[i].includes(ruta)) {
        return true;
      }
    }
  }

  return false;
}


app.use(function (req, res, next) {

  const url = req.originalUrl;
  var ima_token = false;
  var authToken;
  var decoded;
  dotenv.config();
  const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;


  //---------------------
  /*
    Provjeravamo da li korisnik ima validan auth token. U slucaju da ga nema ili da je token zbog neceg ne važi onda ga propustamo na dozvoljenu rutu ili redirektamo na login formu.
  */
  try {
    // const cookies = req.headers.cookie.split('; ');
    // for (let i = 0; i < cookies.length; i++) {
    //   if (cookies[i].split("=")[0] == 'authToken') {
    //     authToken = cookies[i].split("=")[1];
    //     decoded = jwt.verify(authToken, JWT_TOKEN);
    //     ima_token = true;
    //     break;
    //   }
    // }

    authToken = req.cookies.authToken;
    if (authToken === undefined) {
      ima_token = false;
    }
    else {
      ima_token = true;
      decoded = jwt.verify(authToken, JWT_TOKEN);
    }

  }
  catch (error) {
    //console.log(error);
    ima_token = false;
  }

  if (ima_token === false && rute_dostupne_svima.includes(url)) {
    console.log("IF 1");
    return next();
  }
  else if (ima_token === false) {
    console.log("IF 2");
    return res.redirect('/');
  }



  //---------------------

  /*
    Provjeravamo da li korisnik ima pristup ruti, ukoliko nema radi se redirekt na njegovu pocetnu stranicu (ako je npr trgovac ide na trgovina dashboard, admin na admih dashboard a kupac na njegovu pocetnu stranicu).
  */


  

  if (url === '/login/logout') {
    return next();
  }

  try {
    req.rola = decoded.tip;
    req.korisnik = decoded;

    if (req.rola === 2) {
      req.trgovina = jwt.verify(req.cookies.trgToken, JWT_TOKEN);
    }
  } catch (err) {
    console.log("CATCH 1");
    return res.redirect('/');
  }

  return next();
  
  console.log("REDIREKT 2");
  if (req.rola === 1 && admin_rute.includes(url)) {
    return next();
  }
  else if (req.rola === 2 && trgovac_rute.includes(url)) {
    console.log("TRGOVAC");
    return next();
  }
  else if (req.rola === 3 && kupac_rute.includes(url)) {
    return next();
  }
  console.log("REDIREKT");
  if (req.rola === 1) {
    return res.redirect('/admin');
  }
  else if (req.rola === 2) {
    return res.redirect('/trgovina');
  }
  else if (req.rola === 3) {
    return res.redirect('/pocetna');
  }

  return next();
});


app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
//app.use('/naslovna', naslovnaRouter);
app.use('/trgovina', trgovinaRouter);
app.use('/pocetna', pocetna_stranica);
app.use('/artikal', artikal);
app.use('/admin', administrator);
app.use('/chat', chat);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
