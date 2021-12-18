var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var dotenv = require('dotenv');
const bcrypt = require('bcrypt');
var pool = require('../database/index.js');


dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN_SECRET;


var db_funkcije = {
    getKorisnik: (email) => {
        return new Promise((resolve, reject) => {
            pool.query('select * from korisnici where email = $1', [email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                //console.log(result.rows);
                return resolve(result.rows);

            })
        })
    },
};

/* Generise JWT token, default vrijeme trajanja tokena je 12h, ako je korisnik 
čekirao "Zapamti me" onda je vrijeme trajanja 30 dana */
const generisiToken = (user_id, username, email, JWT_TOKEN) => {
    return jwt.sign({ name: username, id: user_id, user_email: email }, JWT_TOKEN, { expiresIn: '1800s' });
}


/* Auth logina i dodjela JWT tokena */
router.post('/', function (req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const remember_me = req.body.rememberme;
    console.log(remember_me);

    db_funkcije.getKorisnik(email).then(
        (result1) => {
            bcrypt.compare(password, result1[0].password_hash, function (err, result) {
                if (result) {
                    const token = generisiToken(result1[0].id, result1[0].username, result1[0].email, JWT_TOKEN);
                    //console.log(token);
                    res.cookie('authToken', token);
                    res.cookie('userName', result1[0].username);
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
});

module.exports = router;
