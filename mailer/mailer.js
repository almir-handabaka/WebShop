"use strict";
// TBD prebaci varijable u .env

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = '774674605399-5jfrvpnpk71l11tblafgbei0q5kiaa3q.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04qjZ_XvPXPnSCgYIARAAGAQSNwF-L9IrcNh38tB-ahI6p48mcwpb9ALg3iAIbt3pz_ArLcAaujK5nyJ-XbFpcZ2SDJ5VH5FXbUY';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);


async function sendMail() {
  try {

    oAuth2Client.setCredentials({
      refresh_token: REFRESH_TOKEN
    });

    const accessToken = oAuth2Client.getAccessToken()
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
      to: 'virusgraffitimaker@gmail.com',
      subject: 'Hello from gmail using API',
      text: 'Hello from gmail email using API',
      html: '<h1>Hello from gmail email using API</h1>',
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
