const express = require("express")
const cors = require("cors")
require("dotenv").config()
const userRoutes = require("./routes/clientRoutes")

const app = express();
const allowedOrigins = [
   "http://localhost:5173",
   "http://localhost:3000",
   "https://boche1000acre.com",
   "https://www.boche1000acre.com",
   "https://dev.boche1000acre.com",
];

app.use(cors({
   origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".boche1000acre.com")) {
         return callback(null, true);
      }
      return callback(null, false);
   },
   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
   credentials: true
}));
app.options("*", cors());
app.use(express.json())

app.get("/", (req, res) => {
   res.send("Server running");
});


app.get("/health", (req, res) => {
   res.json({
      success: true
   });
});

app.use("/", userRoutes)
module.exports = app;
