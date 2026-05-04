const express= require("express")
const cors= require("cors")
require("dotenv").config()
const userRoutes= require("./routes/clientRoutes") 

const app= express();
app.use(cors())
app.use(express.json()) 



app.use("/",userRoutes) 
module.exports = app;
