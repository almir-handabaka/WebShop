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


var pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.dbport,
    rowMode: 'array'
    //max: 10, // set pool max size to 10
    //idleTimeoutMillis: 1000, // close idle clients after 1 second
    //connectionTimeoutMillis: 1000,
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
        const { trgovina_id, kategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina } = artikal;

        return new Promise((resolve, reject) => {
            pool.query('insert into artikli (trgovina_id, kategorija_id, naziv_artikla, opis_artikla, lokacija, stanje, cijena, kolicina) values($1, $2, $3, $4, $5, $6, $7, $8)', [trgovina_id, kategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina], (err, result) => {
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
            pool.query('select * from artikli as ar inner join glavne_kategorije as gk on ar.kategorija_id = gk.id_kategorije inner join lokacije_trgovina lt on ar.lokacija = lt.id where ar.trgovina_id = $1', [trgovina_id], (err, result) => {
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
        console.log(artikal);
        const { trgovina_id, kategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina, zadnja_promjena, id_artikla } = artikal;
        return new Promise((resolve, reject) => {
            pool.query('update artikli set kategorija_id = $1, naziv_artikla= $2, opis_artikla= $3, lokacija= $4, stanje= $5, cijena= $6, kolicina= $7, zadnja_promjena= $8 where trgovina_id = $9 and id_artikla = $10', [kategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina, zadnja_promjena, trgovina_id, id_artikla], (err, result) => {
                if (err) {
                    return reject(err);
                }
                console.log("update uspjesan");
                return resolve();
            })
        })
    },

    // delete artikal
    izbrisiArtikal: (artikal_id) => {
        return new Promise((resolve, reject) => {
            pool.query('delete from artikli where id_artikla = $1', [artikal_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    // get kategorije
    dohvatiKategorije: () => {
        return new Promise((resolve, reject) => {
            pool.query('select * from glavne_kategorije', (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dohvatiLokacijeTrgovine: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query('select * from lokacije_trgovina where trgovina_id = $1', [trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },


};

//module.exports = pool;

