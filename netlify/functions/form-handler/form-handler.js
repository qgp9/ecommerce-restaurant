const querystring = require("querystring");
const nodemailer = require("nodemailer");
const _ = require("lodash");

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

async function addToSheets(data) {
  let err = null;
  const { GoogleSpreadsheet } = require("google-spreadsheet");
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

  if (process.env.SMTP_SECURE) transportConf.secure = true;

  if (process.env.OAUTH_CLIENT_ID) {
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
  }

  let transporter = nodemailer.createTransport(transportConf);

  // configure message
  const subject = "[Manna] Your reservation has been recorded ";
  const text = `Dear ${data.name}
    Your reservation has been recorded.
    I will contact you back for a verification

    Name: ${data.name}
    Email: ${data.email}
    Phone: ${data.phone}
    Party: ${data.party}
    Date: ${data.date}
    Time: ${data.time}

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

exports.handler = async (event, context) => {
  let res = {};
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    checkBeforeAddToSheetEnv();
  } catch (e) {}
  // parse data
  const params = querystring.parse(event.body);
  const fields = ["name", "phone", "email", "party", "date", "time"];
  const data = _.pick(params, fields);

  if (!res.err) res = await sendMail(data);
  if (!res.err) res = await addToSheets(data);

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
        <body>
          <header>
            [Manna korean restaurant]
          </header>
          <main>
            <div>
            Dear ${data.name}, Thank you for making a reservation. 
            Please note that we will hold your table for 15 minutes from the time of your booking. 
            If you are running more than 15 minutes late on the day, 
            please give us a call and we will do everything we can to accommodate you.
            Please do not hesitate to contact us at (+358)050-3445562 if you have any questions about your reservation 
            or if you have any special needs.
            </div>
          </main>
        </body>
      </html>
    `,
  };
};
