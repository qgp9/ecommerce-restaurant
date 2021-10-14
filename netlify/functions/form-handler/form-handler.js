import Busboy from 'busboy';
import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import _ from 'lodash';
import { GoogleSpreadsheet } from "google-spreadsheet";
import Debug from "debug";
const debug = Debug("FormHandler")

if (!process.env.NETLIFY) {
  require("dotenv").config();
}

async function checkBeforeAddToSheetEnv() {
  if (!process.env.GOOGLE_SPREADSHEET_ID_FROM_URL)
    throw new Error("no GOOGLE_SPREADSHEET_ID_FROM_URL env var set");
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    throw new Error("no GOOGLE_SERVICE_ACCOUNT_EMAIL env var set");
  if (!process.env.GOOGLE_PRIVATE_KEY)
    throw new Error("no GOOGLE_PRIVATE_KEY env var set");
  if (!process.env.GOOGLE_SPREADSHEET_ID_FROM_URL)
    throw new Error("no GOOGLE_SPREADSHEET_ID_FROM_URL env var set");
}

function parseMultipartForm(event) {
  debug("parseMultipartForm");
  return new Promise((resolve) => {
    const fields = {};
    const busboy = new Busboy({
      headers: event.headers
    });
    busboy.on("field", (fieldName, value) => {
      fields[fieldName] = value;
    });
    busboy.on("finish", () => {
      resolve(fields)
    });
    busboy.write(event.body);
  });
}

async function addToSheets(data) {
  debug("addToSheets");
  let err = null;
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID_FROM_URL);

  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow(data);
    return { err };
  } catch (err) {
    return { err };
  }
}

async function sendMail(data) {
  debug("sendMail");
  // Configure transporter
  let transportConf = {
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
  };

  transportConf.secure = process.env.SMTP_SECURE ? true : false;

  if (process.env.SMTP_SERVICE === 'gmail') {
    transportConf = {
      ...transportConf,
      service: "gmail",
      secure: "true",
      auth: {
        type: "OAuth2",
        user: process.env.OAUTH_USER,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      },
    };
  } else {
    transportConf = {
      ...transportConf,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  }

  let transporter = nodemailer.createTransport(transportConf);

  // configure message
  const subject = "[Manna] Your reservation has been recorded.";
  const text = `Dear ${data.name},
    Thank you for making a reservation.
    Your reservation has been recorded.

    Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone}
    Party: ${data.party}
    Date: ${data.date}
    Time: ${data.time}

    Please note that we will hold your table for 15 minutes from the time of your booking.
    If you are running more than 15 minutes late on the day, please give us a call and we will do everything we can to accommodate you.
    Please do not hesitate to contact us at (+358)050-3445562 if you have any questions about your reservation or if you have any special needs.

    Best Regards,
    Manna
  `;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: data.email,
    cc: process.env.EMAIL_FROM,
    subject,
    text,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    return { err: null };
  } catch (err) {
    return { err };
  }
}

async function verifyRecaptcha(response) {
  debug("verifyRecaptcha");
  const data = new URLSearchParams();
  data.append('secret', process.env.RECAPTCHA_SECRET);
  data.append('response', response);
  const res =  await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'post',
    body: data,
  }).then(res => res.json());
  res.err = !res.success;
  return res;
}

export async function handler(event, context) {
  let res = {};
  let err = null;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    checkBeforeAddToSheetEnv();
  } catch (e) {res.err = e} // TODO

  // parse data
  const params = await parseMultipartForm(event).catch(e => res.err = e);
  const fields = ["name", "phone", "email", "party", "date", "time"];
  const data = _.pick(params, fields);

  debug(`ENABLE_RECAPTCHA=${process.env.ENABLE_RECAPTCHA}`);
  if (!res.err && process.env.ENABLE_RECAPTCHA)
    res = await verifyRecaptcha(params['g-recaptcha-response']);
  debug(`ENABLE_EMAIL=${process.env.ENABLE_EMAIL}`);
  if (!res.err && process.env.ENABLE_EMAIL) res = await sendMail(data);
  debug(`ENABLE_SHEETS=${process.env.ENABLE_SHEETS}`);
  if (!res.err && process.env.ENABLE_SHEETS) res = await addToSheets(data);

  if (res.err) {
    console.log(res.err);
    return {
      statusCode: 500,
      err: res.err,
      body: "500 Internal Server Error",
    };
  }

  return {
    statusCode: 200,
    body: `
      <html>
        <body style="margin: 3rem; backgroundColor: rgb(251, 247, 237);">
          <header style="color: rgba(175, 149, 74, 1); margin: 0 auto;">
            <h3>[Manna korean restaurant]</h3>
          </header>
          <main style="border: 1px solid red; padding: 2rem;">
            <div>
              Dear <strong>${data.name}</strong>, Thank you for making a reservation. 
              <p>
                Please note that we will hold your table for <strong>15 minutes</strong> from the time of your booking.
              </p>
              <p>
                If you are running more than 15 minutes late on the day, 
                please give us a call and we will do everything we can to accommodate you.
              </p>
              <p>
                Please do not hesitate to contact us at <strong>(+358)050-3445562</strong> if you have any questions about your reservation 
                or if you have any special needs.
              </p>
              <div style="color:rgba(175, 149, 74, 1); text-decoration: none">
                <a href="https://mannaravintola.netlify.app">
                  <p style="color:rgba(175, 149, 74, 1)">Go back to Manna</p>
                </a>
              </div>
            </div>
          </main>
        </body>
      </html>
    `,
  };
};
