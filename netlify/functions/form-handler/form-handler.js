import nodemailer from 'nodemailer';
import fetch from 'node-fetch';
import _ from 'lodash';
import { GoogleSpreadsheet } from "google-spreadsheet";

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
}

async function addToSheets(data) {
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
  // Configure transporter
  let transportConf = {
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
  };

  transportConf.secure = process.env.SMTP_SECURE ? true : false;

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
  // TODO: should handle formdata either
  const params = JSON.parse(event.body);
  const fields = ["name", "phone", "email", "party", "date", "time"];
  const data = _.pick(params, fields);

  if (process.env.ENABLE_RECAPTCHA) {
    res = await verifyRecaptcha(params['g-recaptcha-response']);
    if (res.err) {
      return {
        statusCode: 500,
        err: "reCAPTCHA error",
        body: "reCAPTCHA error"
      }
    }
  }

  const tasks = []
  if (process.env.ENABLE_EMAIL) tasks.push(sendMail(data));
  if (process.env.ENABLE_SHEETS) tasks.push(addToSheets(data));

  // wait results of all tasks
  const rets = await Promise.all(tasks)
  // 이메일/구글 중에 하나라도 성공하면 성공으로 하자
  const error = rets.reduce((e,t) => (e && t.err ), true);
  if (error) {
    return {
      statusCode: 500,
      err: "unknown Error",
      body: "Unknown Error"
    }
  };
  return {
    statusCode: 200,
    body: 'ok'
  };
};
