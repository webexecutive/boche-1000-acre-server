const express = require("express")
const cors = require("cors")
require("dotenv").config()
const userRoutes = require("./routes/clientRoutes")

const app = express();
app.use(cors({
   origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://boche1000acre.in",
      "https://www.boche1000acre.in"
   ],
   methods: ["GET", "POST"],
   credentials: true
}))
app.use(express.json())

app.get("/", (req, res) => {
   res.send("Server running");
});

app.get("/health", (req, res) => {
   res.json({
      success: true
   });
});

app.get("/debug", (req, res) => {
   let credentialsValid = false;
   let clientEmail = "";

   try {
      const credentials = JSON.parse(
         Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
      );
      credentialsValid = !!credentials.private_key && !!credentials.client_email;
      clientEmail = credentials.client_email || "";
   } catch (e) {
      credentialsValid = false;
   }

   res.json({
      hasCredentialsBase64: !!process.env.GOOGLE_CREDENTIALS_BASE64,
      base64Length: process.env.GOOGLE_CREDENTIALS_BASE64?.length || 0,
      credentialsValid,
      clientEmail,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
   });
});

app.get("/test-sheets", async (req, res) => {
   try {
      const { GoogleSpreadsheet } = require('google-spreadsheet');
      const { JWT } = require('google-auth-library');

      const credentials = JSON.parse(
         Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf8')
      );

      const serviceAccountAuth = new JWT({
         email: credentials.client_email,
         key: credentials.private_key,
         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(
         '1kitHHSFSkaF1__QrnR0lrAR8b1ZXL47vt3wHY7WeGUU',
         serviceAccountAuth
      );

      await doc.loadInfo();
      res.json({
         success: true,
         sheetTitle: doc.title,
      });
   } catch (error) {
      res.json({
         success: false,
         error: error.message,
      });
   }
});

app.get("/test-email", async (req, res) => {
    try {
        const sendConfirmationMail = require("../services/mailService");
        await sendConfirmationMail(
            process.env.EMAIL_USER,
            "Test",
            null
        );
        res.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message,
        });
    }
});

app.use("/", userRoutes)
module.exports = app;
