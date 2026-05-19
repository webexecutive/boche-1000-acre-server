const express = require("express")
const cors = require("cors")
require("dotenv").config()
const userRoutes = require("./routes/clientRoutes")

const app = express();
app.use(cors({
   origin: [
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
    res.json({
        hasEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        hasKey: !!process.env.GOOGLE_PRIVATE_KEY,
        keyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
        emailUser: !!process.env.EMAIL_USER,
        emailPass: !!process.env.EMAIL_PASS,
    });
});

app.use("/", userRoutes)
module.exports = app;
