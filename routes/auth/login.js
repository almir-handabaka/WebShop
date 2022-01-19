var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const { db_funkcije, pool } = require('.././database/index.js');


dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;


/* Generise JWT token, default vrijeme trajanja tokena je 12h, ako je korisnik 
čekirao "Zapamti me" onda je vrijeme trajanja 30 dana */
const generisiToken = (korisnik, remember_me, JWT_TOKEN) => {
    let duzina_trajanja = { expiresIn: '3600s' };
    if (remember_me != undefined) {
        duzina_trajanja.expiresIn = '30d';
    }
    return jwt.sign(korisnik, JWT_TOKEN, duzina_trajanja);
}
// almir.handabaka@gmail.com    almir123
// almir.a@gmail.ba   almir321
/* Auth logina i dodjela JWT tokena */
router.post('/', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const remember_me = req.body.rememberme;

    if (Object.keys(req.body).length < 2) {
        console.log("Losi parametri");
        res.status(406).end('username/password');
    } else {
        db_funkcije.getKorisnik(email).then(
            (result1) => {
                if (result1[0] === undefined) {
                    res.status(406).json({ error: 'username/password' });
                }
                bcrypt.compare(password, result1[0].password_hash, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    else if (result && result != undefined) {
                        const korisnik = { id: result1[0].id, ime: result1[0].ime, prezime: result1[0].prezime, tip: result1[0].tip_korisnika, email: result1[0].email };
                        const token = generisiToken(korisnik, remember_me, JWT_TOKEN);
                        //console.log(token);
                        res.cookie('authToken', token);
                        //res.cookie('userName', result1[0].username);
                        res.status(200).json({ token: token });
                    }
                    else if (result1.length != 0) {
                        console.log("Sifra ne odgovara");
                        res.status(406).json({ error: 'username/password' });
                    }
                    else {
                        res.status(406).json({ error: 'username/password' });
                    }
                });
            },
            (error) => {
                console.log(error);
                console.log("Greska tokom logina");
                res.sendStatus(500);
            }
        );

    }
});

// izbrisati token
router.get('/logout', function (req, res, next) {
    res.clearCookie("authToken");
    res.redirect('/');
});




module.exports = router;
