var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { db_funkcije } = require('.././database/index.js');

// almir
// test123



// var db_funkcije = {
//     getKorisnik: (email) => {
//         return new Promise((resolve, reject) => {
//             pool.query('select * from korisnici where email = $1', [email], (err, result) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 return resolve(result.rows);

//             })
//         })
//     },

//     dodajKorisnika: (korisnik, password_hash) => {
//         return new Promise((resolve, reject) => {
//             pool.query('insert into korisnici (ime, prezime, email, password_hash, tip_korisnika) values($1, $2, $3, $4, $5)', [korisnik.ime, korisnik.prezime, korisnik.email, password_hash, korisnik.tip], (err, result) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 return resolve(result);

//             })
//         });
//     },

//     dodajTrgovinu: (naziv_trgovine, korisnik_id) => {
//         return new Promise((resolve, reject) => {
//             pool.query('insert into trgovine (naziv, korisnik_id) values($1, $2)', [naziv_trgovine, korisnik_id], (err, result) => {
//                 if (err) {
//                     return reject(err);
//                 }
//                 return resolve(result);

//             })
//         });
//     },


// };

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
    const tip = 3;
    const korisnik = {
        ime: req.body.ime,
        prezime: req.body.prezime,
        email: req.body.email,
        plaintext_password: req.body.password,
        tip: tip,
    }
    // const ime = req.body.ime;
    // const prezime = req.body.prezime;
    // const email = req.body.email;
    // const plaintext_password = req.body.password;



    hashPassword(korisnik.plaintext_password).then(
        (hash) => {
            return hash;
        }
    ).then(
        (hash) => {
            return db_funkcije.dodajKorisnika(korisnik, hash);
        }
    ).then((result) => {
        console.log(korisnik.ime, korisnik.prezime, " uspjesno registrovan");
        res.send("Uspjesno");
    }).catch((error) => {
        console.error("Korisnik sa istim emailom postoji u bazi!");
        console.log(error);
        res.send("Fail"); // zamjeni sa redirektom
    });


});

router.post('/trgovina', function (req, res, next) {
    const tip = 2;
    const korisnik = {
        ime: req.body.ime,
        prezime: req.body.prezime,
        email: req.body.email,
        plaintext_password: req.body.password,
        naziv_trgovine: req.body.naziv_trgovine,
        tip: tip,
    }
    console.log(korisnik);
    // const ime = req.body.ime;
    // const prezime = req.body.prezime;
    // const email = req.body.email;
    // const plaintext_password = req.body.password;
    // const naziv_trgovine = req.body.naziv_trgovine;



    hashPassword(korisnik.plaintext_password).then(
        (hash) => {
            return hash;
        }
    ).then((hash) => {
        return db_funkcije.dodajKorisnika(korisnik, hash);
    }
    ).then(() => {
        return db_funkcije.getKorisnik(korisnik.email);
    }).then((result) => {
        db_funkcije.dodajTrgovinu(korisnik.naziv_trgovine, result[0].id);
        console.log("Trgovac uspjesno registrovan");
        res.send("Trgovac uspjesno registrovan");
    }).catch((error) => {
        console.error("Trgovac sa istim emailom postoji u bazi!");
        console.log(error);
        res.send("Fail"); // zamjeni sa redirektom
    });

});

// promjeni pw, log out korisnika da se ponovo logina s novom sifrom i osvjezi token
// sa refresh tokenom provjeravati da li je doslo do promjene na drugim uredjajima
router.post('/promjena_sifre', function (req, res, next) {
    let nova_sifra = req.body.nova_sifra;
    if (nova_sifra.length < 5 || nova_sifra === undefined) {
        res.sendStatus(404);
    }

    let email = "almir.a@gmail.ba"; // zamjeniti sa req.korisnik.email
    hashPassword(nova_sifra).then(
        (hash) => {
            return db_funkcije.promjeniSifru(email, hash);
        }
    ).then(() => {
        res.sendStatus(200);
        //res.redirect('/login/logout');
    }).catch((error) => {
        console.log(error);
        res.sendStatus(404);
    });


});



module.exports = router;
