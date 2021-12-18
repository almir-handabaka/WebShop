var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

// almir
// test123

const pool = new Pool({
  user: 'qhnzgbyb',
  host: 'abul.db.elephantsql.com',
  database: 'qhnzgbyb',
  password: 'Xl1jeBR_slvODzGyVM_l-VRdi1myfxTZ',
  port: 5432,
})


var db_funkcije = {
    getKorisnik: (username, email) => {
        return new Promise((resolve,reject) => {
            pool.query('select * from korisnici where username = $1 or email = $2', [username, email], (err, result) => {
                if(err){
                    return reject(err);
                }
                return resolve(result.rows);
                
            })
        })
    },

    sacuvajNovogKorisnika: (username, hash, email, tip) => {
        return new Promise((resolve,reject) => {
            pool.query('insert into korisnici (username, password_hash, email, tip) values($1, $2, $3, $4)', [username, hash, email, tip], (err, result) => {
                if(err){
                    return reject(err);
                }
                return resolve();
                
            })
        });
    }


};


/*  Registracija korisnika i trgovine 
    Ne dozvoljava se registracija ako vec postoji slican username i email sacuvan u bazi

*/

router.post('/user', function(req, res, next) {
    const username = req.body.username_korisnika;
    const password = req.body.password_korisnika;
    const email = req.body.email_korisnika;
    let tip = 1;
    
    db_funkcije.getKorisnik(username, email).then(
        (result) => {
            if(result.length != 0)
                res.status(406).json({ error: 'username/email' });
            else{
                const saltRounds = 10;
                const myPlaintextPassword = password;
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                        db_funkcije.sacuvajNovogKorisnika(username, hash, email, tip).then(
                            ()=> {
                                console.log("Novi korisnik uspjesno registrovan!");
                                //res.redirect('/login')
                                res.status(200);
                            },
                            (error) => {
                                console.log(error);
                                console.log("Novi korisnik NIJE uspjesno registrovan!");
                                res.status(500);
                                //res.redirect('/register');
                            }

                        );
                    });
                });
            }
        },
        (err) => {
            console.log(err);
            res.status(500);
        }
    );
});

router.post('/trgovina', function(req, res, next) {
  const username = req.body.naziv_trgovine;
    const password = req.body.password_trgovine;
    const email = req.body.email_trgovine;
    let tip = 1;
    
    db_funkcije.getKorisnik(username, email).then(
        (result) => {
            if(result.length != 0)
                res.status(406).json({ error: 'username/email' });
            else{
                const saltRounds = 10;
                const myPlaintextPassword = password;
                bcrypt.genSalt(saltRounds, function(err, salt) {
                    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
                        db_funkcije.sacuvajNovogKorisnika(username, hash, email, tip).then(
                            ()=> {
                                console.log("Novi korisnik uspjesno registrovan!");
                                //res.redirect('/login')
                                res.status(200);
                            },
                            (error) => {
                                console.log(error);
                                console.log("Novi korisnik NIJE uspjesno registrovan!");
                                res.status(500);
                                //res.redirect('/register');
                            }

                        );
                    });
                });
            }
        },
        (err) => {
            console.log(err);
            res.status(500);
        }
    );
});

module.exports = router;
