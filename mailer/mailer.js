"use strict";
// TBD prebaci varijable u .env

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// tekst maila u zavisnosti promjene statusa isporuke
// prvi element subject, drugi text
// broj narudzbe, Name of the product. SKU Quantity. Color. Size. Unit price.


const pripremiSadrzajMaila = (tipMaila, kupac, narudzba) => {
  let subject, text;

  if (tipMaila === 2) {
    subject = "Web Shop - potvrda narudžbe";
    text = `Poštovani kupac, narudžba #${narudzba.id_narudzbe} je PRIHVAĆENA.
      Naziv artikla: ${narudzba.naziv_artikla}
      Kolicina: ${narudzba.kolicina}
      Cijena po komadu: ${narudzba.cijena_po_kom}
      Ukupna cijena (kolicina * cijena po komadu): ${narudzba.kolicina * narudzba.cijena_po_kom} 

      Evidenciju Vaših narudžbi možete provjeriti na sledećem linku: http://localhost:3000/artikal/narudzbe
    `
  }
  else if (tipMaila === 3) {
    subject = "Web Shop - odbijena narudžba";
    text = `Poštovani kupac, narudžba #${narudzba.id_narudzbe} je ODBIJENA.
      Naziv artikla: ${narudzba.naziv_artikla}
      Kolicina: ${narudzba.kolicina}
      Cijena po komadu: ${narudzba.cijena_po_kom}
      Ukupna cijena (kolicina * cijena po komadu): ${narudzba.kolicina * narudzba.cijena_po_kom} 

      Evidenciju Vaših narudžbi možete provjeriti na sledećem linku: http://localhost:3000/artikal/narudzbe
    `
  }
  else if (tipMaila === 4) {
    subject = "Web Shop - isporuka";
    text = `Poštovani kupac, narudžba #${narudzba.id_narudzbe} je ISPORUČENA.
      Naziv artikla: ${narudzba.naziv_artikla}
      Kolicina: ${narudzba.kolicina}
      Cijena po komadu: ${narudzba.cijena_po_kom}
      Ukupna cijena (kolicina * cijena po komadu): ${narudzba.kolicina * narudzba.cijena_po_kom} 

      Evidenciju Vaših narudžbi možete provjeriti na sledećem linku: http://localhost:3000/artikal/narudzbe
    `
  }


  return { text: text, subject: subject };

}


// prebaciti u .env
const CLIENT_ID = '774674605399-5jfrvpnpk71l11tblafgbei0q5kiaa3q.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04qjZ_XvPXPnSCgYIARAAGAQSNwF-L9IrcNh38tB-ahI6p48mcwpb9ALg3iAIbt3pz_ArLcAaujK5nyJ-XbFpcZ2SDJ5VH5FXbUY';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);


async function sendMail(tipMaila, kupac, narudzba) {
  try {
    const sadrzajMaila = pripremiSadrzajMaila(tipMaila, kupac, narudzba);

    oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN
    });

    const accessToken = oAuth2Client.getAccessToken();
    console.log(accessToken);
    const smtpTransport = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        type: "OAuth2",
        user: "almir.handabaka@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken
      }
    });

    const mailOptions = {
      from: 'almir.handabaka@gmail.com',
      to: kupac.email,
      subject: sadrzajMaila.subject,
      text: sadrzajMaila.text,
      html: '',
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      error ? console.log(error) : console.log(response);
      smtpTransport.close();
    });


  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = sendMail;
