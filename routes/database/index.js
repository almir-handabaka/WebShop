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
    max: 3, // set pool max size to 10
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 1000,
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
            pool.query('insert into artikli (trgovina_id, kategorija_id, naziv_artikla, opis_artikla, lokacija, stanje, cijena, kolicina) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_artikla', [trgovina_id, kategorija_id, naziv, opis, lokacija, stanje, cijena, kolicina], (err, result) => {
                if (err) {
                    return reject(err);
                }

                //console.log(result.rows);
                return resolve(result.rows[0].id_artikla);
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

    sacuvajFotografije: (fotografije, id_artikla) => {
        let upit = "INSERT INTO fotografije_artikala (naziv_fotografije, id_artikla)VALUES";
        console.log("Dodavanje fotografije");
        for (let i = 0; i < fotografije.length; i++) {
            upit += `($${i + 1}, ${id_artikla})`;
            if (i != fotografije.length - 1) {
                upit += ",";
            }
        }
        upit += ';';

        //console.log(upit);

        return new Promise((resolve, reject) => {
            pool.query(upit, fotografije, (err, result) => {
                if (err) {
                    console.log("Fotografija neupsjesno dodata");
                    return reject(err);
                }
                console.log("Fotografija uspjesno dodata");
                return resolve();
            })
        })
    },

    dohvatiFotografije: (id_artikla) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from  fotografije_artikala where id_artikla = $1", [id_artikla], (err, result) => {
                if (err) {
                    console.log("Error pri dohvacanju fotografija!");
                    return reject(err);
                }
                console.log("Fotografije uspjesno dohvacene!");
                return resolve(result.rows);
            })
        })
    },

    izbrisiFotografiju: (foto_id) => {
        return new Promise((resolve, reject) => {
            pool.query("delete from fotografije_artikala where id = $1", [foto_id], (err, result) => {
                if (err) {
                    console.log("Error pri brisanju fotografije!");
                    return reject(err);
                }
                console.log("Foto izbrisan");
                return resolve();
            })
        })
    },

    dohvatiPodatkeOTrgovini: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from korisnici kr inner join trgovine tr on kr.id = tr.korisnik_id inner join lokacije_trgovina lt on tr.id = lt.trgovina_id where tr.id = $1", [trgovina_id], (err, result) => {
                if (err) {
                    console.log("Error pri dohvacanju podataka o trgovini!");
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },
    // 0 poslata, 1 prihvacena, 2 odbijena, 3 isporuceno
    dohvatiAktivneNarudzbe: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from narudzbe nr inner join artikli ar on nr.artikal_id = ar.id_artikla inner join korisnici ko on nr.porucioc_id = ko.id where (nr.status_isporuke = 0 or nr.status_isporuke = 1) and nr.trgovina_id = $1", [trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dohvatiSveNarudzbe: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from narudzbe nr inner join artikli ar on nr.artikal_id = ar.id_artikla inner join korisnici ko on nr.porucioc_id = ko.id where nr.trgovina_id = $1", [trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    promjeniStatusNarudzbe: (id_narudzbe, novi_status, trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("update narudzbe set status_isporuke = $1 where id_narudzbe = $2 and trgovina_id = $3", [novi_status, id_narudzbe, trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },



};

//module.exports = pool;

