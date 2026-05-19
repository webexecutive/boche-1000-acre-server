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




app.use("/", userRoutes)
module.exports = app;
