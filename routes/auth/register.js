var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
var { pool } = require('../database/index.js');

// almir
// test123



var db_funkcije = {
    getKorisnik: (email) => {
        return new Promise((resolve, reject) => {
            pool.query('select * from korisnici where email = $1', [email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);

            })
        })
    },

    dodajKorisnika: (ime, prezime, email, password_hash, tip) => {
        return new Promise((resolve, reject) => {
            pool.query('insert into korisnici (ime, prezime, email, password_hash, tip_korisnika) values($1, $2, $3, $4, $5)', [ime, prezime, email, password_hash, tip], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);

            })
        });
    },

    dodajTrgovinu: (naziv_trgovine, korisnik_id) => {
        return new Promise((resolve, reject) => {
            pool.query('insert into trgovine (naziv, korisnik_id) values($1, $2)', [naziv_trgovine, korisnik_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);

            })
        });
    },


};

const hashPassword = (plaintext_password) => {
    let saltRounds = 10;
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            bcrypt.hash(plaintext_password, salt, function (err, hash) {
                if (err) {
                    reject(err);
                }
                return resolve(hash);
            });
        });
    });

}



/*  Registracija korisnika i trgovine 
    Ne dozvoljava se registracija ako vec postoji isti email sacuvan u bazi
*/

router.post('/user', function (req, res, next) {
    const ime = req.body.ime;
    const prezime = req.body.prezime;
    const email = req.body.email;
    const plaintext_password = req.body.password;

    const tip = 3;

    hashPassword(plaintext_password).then(
        (hash) => {
            return hash;
        }
    ).then(
        (hash) => {
            return db_funkcije.dodajKorisnika(ime, prezime, email, hash, tip);
        }
    ).then((result) => {
        console.log(ime, prezime, " uspjesno registrovan");
        res.send("Uspjesno");
    }).catch((error) => {
        console.error("Korisnik sa istim emailom postoji u bazi!");
        //console.log(error);
        res.send("Fail"); // zamjeni sa redirektom
    });


});

router.post('/trgovina', function (req, res, next) {
    const ime = req.body.ime;
    const prezime = req.body.prezime;
    const email = req.body.email;
    const plaintext_password = req.body.password;
    const naziv_trgovine = req.body.naziv_trgovine;

    const tip = 2;

    hashPassword(plaintext_password).then(
        (hash) => {
            return hash;
        }
    ).then((hash) => {
        return db_funkcije.dodajKorisnika(ime, prezime, email, hash, tip);
    }
    ).then(() => {
        return db_funkcije.getKorisnik(email);
    }).then((result) => {

        db_funkcije.dodajTrgovinu(naziv_trgovine, result[0].id);
        console.log("Trgovac uspjesno registrovan");
        res.send("Trgovac uspjesno registrovan");
    }).catch((error) => {
        console.error("Trgovac sa istim emailom postoji u bazi!");
        console.log(error);
        res.send("Fail"); // zamjeni sa redirektom
    });

});

module.exports = router;
