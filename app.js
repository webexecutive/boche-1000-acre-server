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


app.use("/", userRoutes)
module.exports = app;
