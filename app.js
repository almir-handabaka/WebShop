var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv');
var jwt = require('jsonwebtoken');
const { db_funkcije } = require('./routes/database/index.js');

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

const generisiAuthToken = (korisnik, remember_me, JWT_TOKEN) => {
  let duzina_trajanja = { expiresIn: '900s' };
  return jwt.sign(korisnik, JWT_TOKEN, duzina_trajanja);
}

app.use(async function (req, res, next) {

  const url = req.originalUrl;
  let ima_auth_token = false;
  let ima_refreshn_token = false;
  var authToken, refreshToken;
  let email;
  var decoded, decoded_refresh_token;
  dotenv.config();
  const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;



  /*
    Trenutno imamo 2 glavna tokena za autentikaciju. Jedan je auth token koji traje oko 900s, drugi je refresh token koji traje 2h ili 30d.
    
    Kako ne bi stalno provjeravali korisnika u bazi a npr. mogli relativno brzo da radimo promjene nad njegovim profilom kao blokiranje profila i slicno, provjera profila u bazi se radi nakon svakog isteka authTokena. Ako je sve uredu u bazi i ako refreshToken nije istekao generisemo novi authToken i korisnik moze nastaviti koristiti nasu aplikaciju dok ne bude blokiran ili dok mu refreshToken ne istekne.

  */
  try {
    authToken = req.cookies.authToken;
    refreshToken = req.cookies.refreshToken;
    email = req.cookies.email;




    // postoji li refresh token i dekodiranje
    if (refreshToken === undefined) {
      ima_refreshn_token = false;
    }
    else {
      ima_refreshn_token = true;
      decoded_refresh_token = jwt.verify(authToken, JWT_TOKEN);
    }

    // ako nema email, znaci nesta nije uredu, ovo ce preusmjeriti korisnika na login stranicu
    if (email === undefined) {
      ima_refreshn_token = false;
    }


    // postoji li auth token i dekodiranje
    if (authToken === undefined) {
      ima_auth_token = false;
    }
    else {
      ima_auth_token = true;
      decoded = jwt.verify(authToken, JWT_TOKEN);
      req.rola = decoded.tip;
      req.korisnik = decoded;

    }



  }
  catch (error) {

    if (email === undefined) {
      ima_refreshn_token = false;
    }
    // ako nema refreshToken redirektamo ga na neku od dopustenih ruta za korisnika koji nije logovan
    if (ima_refreshn_token === false && rute_dostupne_svima.includes(url)) {
      console.log("Korisnik nema refresh token i ide na rutu dostupnu svima");
      return next();
    }
    else if (ima_refreshn_token === false) {
      console.log("Korisnik nema refresh token i redirektan je na /");
      return res.redirect('/');
    }

    // u ovom slucaju samo nema validan authToken pa provjerimo stanje u db i osvjezimo token

    if (ima_auth_token === false) {
      console.log("Dodjela novog auth tokena")
      try {
        const result1 = await db_funkcije.getKorisnik(email);
        console.log("----------");
        console.log(result1[0].id);
        if (result1[0] === undefined) {
          return res.redirect('/');
        }
        //ako je banovan ne ide refresh tokena nego redirekt na logout
        else if (result1[0].datum_isteka_zabrane && result1[0].datum_isteka_zabrane > Date.now()) {
          return res.redirect('/login/logout');
        }
        // u svakom drugom slucaju refresh authTokena
        // ovde stao, prebacit dobar dio funkcija u helpers funkcije
        else {
          console.log("Dodeljen novi auth token")
          const korisnik = { id: result1[0].id, ime: result1[0].ime, prezime: result1[0].prezime, tip: result1[0].tip_korisnika, email: result1[0].email, first_login: result1[0].first_login };
          const token = generisiAuthToken(korisnik, true, JWT_TOKEN);
          res.cookie('authToken', token);

          console.log("KORISNIK");
          console.log(korisnik);
          req.rola = korisnik.tip;
          req.korisnik = korisnik;

        }

      } catch (error) {
        console.log(error);
      };
    }


  }







  //---------------------

  /*
    Provjeravamo da li korisnik ima pristup ruti, ukoliko nema radi se redirekt na njegovu pocetnu stranicu (ako je npr trgovac ide na trgovina dashboard, admin na admih dashboard a kupac na njegovu pocetnu stranicu).
  */


  //return next();

  // if (url === '/login/logout') {
  //   return next();
  // }



  try {
    if (req.rola === 2) {
      req.trgovina = jwt.verify(req.cookies.trgToken, JWT_TOKEN);
    }
  } catch (err) {
    console.log("Trgovina token je istekao !");
    return res.redirect('/');
  }

  return next();

  // if (req.rola === 1 && admin_rute.includes(url)) {
  //   return next();
  // }
  // else if (req.rola === 2 && trgovac_rute.includes(url)) {
  //   console.log("TRGOVAC");
  //   return next();
  // }
  // else if (req.rola === 3 && kupac_rute.includes(url)) {
  //   return next();
  // }

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
