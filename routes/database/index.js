var { Pool } = require('pg');
var dotenv = require('dotenv');

dotenv.config();

exports.pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport
});


const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport
});

exports.db_funkcije = {
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

    // CRUD artikli
    dodajArtikal: (artikal) => {
        return new Promise((resolve, reject) => {
            pool.query('insert into artikli (trgovina_id, kategorija_id, podkategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina) values($1, $2, $3, $4, $5, $6, $7, $8, $9)', [...artikal], (err, result) => {
                if (err) {
                    return reject(err);
                }
                //console.log(result.rows);
                return resolve();
            })
        })
    },
    //  vraca artikle za jednu trgovinu

    dohvatiArtikle: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query('select * from artikli where trgovina_id = $1', [trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                //console.log(result.rows);
                return resolve(result.rows);
            })
        })
    },

    // update artikla
    updateArtikal: (artikal) => {
        return new Promise((resolve, reject) => {
            pool.query('insert into artikli (trgovina_id, kategorija_id, podkategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina, zadnja_promjena) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [...artikal], (err, result) => {
                if (err) {
                    return reject(err);
                }
                //console.log(result.rows);
                return resolve();
            })
        })
    },

    // delete artikal
    izbrisiArtikal: (artikal_id) => {
        return new Promise((resolve, reject) => {
            pool.query('delete from artikli where id = $1', [artikal_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                //console.log(result.rows);
                return resolve();
            })
        })
    },

    

};

//module.exports = pool;

