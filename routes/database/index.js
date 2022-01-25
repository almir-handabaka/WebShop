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

    dodajKorisnika: (korisnik, password_hash) => {
        return new Promise((resolve, reject) => {
            pool.query('insert into korisnici (ime, prezime, email, password_hash, tip_korisnika) values($1, $2, $3, $4, $5)', [korisnik.ime, korisnik.prezime, korisnik.email, password_hash, korisnik.tip], (err, result) => {
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
            pool.query('select * from artikli_data where trgovina_id = $1', [trgovina_id], (err, result) => {
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

    dohvatiTrgovinu: (id_korisnika) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from trgovine where korisnik_id = $1", [id_korisnika], (err, result) => {
                if (err) {
                    console.log("Error pri dohvacanju podataka o trgovini!");
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dohvatiPodatkeOTrgovini: (trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from korisnici kr inner join trgovine tr on kr.id = tr.korisnik_id left join lokacije_trgovina lt on tr.t_id = lt.trgovina_id inner join gradovi_lk gr on gr.id_grada = lt.grad inner join kantoni_lk ka on gr.kanton = ka.id_kantona where tr.t_id = $1", [trgovina_id], (err, result) => {
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

    dohvatiGradoveIKantone: () => {
        return new Promise((resolve, reject) => {
            pool.query("select * from kantoni_lk; select * from gradovi_lk;", (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            })
        })
    },

    promjeniDetaljeTrgovine: (detalji, trgovina_id, email) => {
        return new Promise((resolve, reject) => {
            pool.query("update trgovine set naziv = $1, opis = $2 where id = $3", [detalji.naziv_trgovine, detalji.opis, trgovina_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },


    promjeniBrojKorisnika: (broj_mobitela, email) => {
        return new Promise((resolve, reject) => {
            pool.query("update korisnici set broj_mobitela = $1 where email = $2", [broj_mobitela, email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    dodajPoslovnicu: (poslovnica, trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("insert into lokacije_trgovina (trgovina_id, grad, adresa_poslovnice) VALUES($1,$2,$3) RETURNING id_lokacije", [trgovina_id, poslovnica.grad, poslovnica.adresa], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    ukloniPoslovnicu: (id_poslovnice, trgovina_id) => {
        return new Promise((resolve, reject) => {
            pool.query("delete from lokacije_trgovina where trgovina_id = $1 and id_lokacije = $2", [trgovina_id, id_poslovnice], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    sacuvajProfilnu: (email, fotografije) => {
        return new Promise((resolve, reject) => {
            pool.query("update korisnici set url_profilna_slika = $1 where email = $2", [fotografije[0], email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    promjeniSifru: (email, hash) => {
        return new Promise((resolve, reject) => {
            pool.query("update korisnici set password_hash = $1 where email = $2", [hash, email], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    dohvatiArtikal: (artikal_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from artikli ar left join lokacije_trgovina lt on ar.lokacija = lt.id_lokacije inner join gradovi_lk gl on lt.grad = gl.id_grada inner join trgovine t on ar.trgovina_id = t.id inner join korisnici kr on kr.id = t.korisnik_id where ar.id_artikla = $1", [artikal_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dohvatiOcjene: (artikal_id) => {
        return new Promise((resolve, reject) => {
            pool.query("select count(*), avg(vrijednost_ocjene) from ocjene_artikala where id_artikla = $1", [artikal_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    pretraziPoKategoriji: (id_kategorije) => {
        return new Promise((resolve, reject) => {
            pool.query("select * from artikli_data where kategorija_id = $1", [id_kategorije], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dohvatiSveTrgovine: () => {
        return new Promise((resolve, reject) => {
            pool.query("select * from trgovine tr inner join korisnici kr on tr.korisnik_id = kr.id", (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result.rows);
            })
        })
    },

    dodajTagove: (tagovi, id_artikla) => {
        let upit = "INSERT INTO artikal_tagovi (at_id_artikla, at_tag) VALUES";
        let vrijednosti = [];
        let brojac = 0;
        console.log("Duzina", tagovi.length);
        for (let i = 0; i < tagovi.length * 2; i += 2) {
            upit += `($${i + 1}, $${i + 2})`;
            if (i !== (tagovi.length * 2) - 2) {
                upit += ",";
            }
            vrijednosti.push(id_artikla, tagovi[brojac].value);
            brojac++;
        }
        upit += ';';


        return new Promise((resolve, reject) => {
            pool.query(upit, vrijednosti, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    dodajInterese: (interesi, korisnik) => {
        let upit = "INSERT INTO interesi_kupaca (ik_korisnik_id, ik_interes) VALUES";
        let vrijednosti = [];
        let brojac = 0;
        console.log("Duzina", interesi.length);
        for (let i = 0; i < interesi.length * 2; i += 2) {
            upit += `($${i + 1}, $${i + 2})`;
            if (i !== (interesi.length * 2) - 2) {
                upit += ",";
            }
            vrijednosti.push(korisnik.id, interesi[brojac].value);
            brojac++;
        }
        upit += ';';


        return new Promise((resolve, reject) => {
            pool.query(upit, vrijednosti, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    },

    promjeniFirstLogin: (korisnik) => {
        console.log(korisnik.email)
        let upit = `UPDATE korisnici SET first_login = false WHERE id = ${korisnik.id};`
        return new Promise((resolve, reject) => {
            pool.query(upit, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve();
            })
        })
    }


};



//module.exports = pool;

