const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { connectMongoDB } = require("./config/db");
const PORT = process.env.PORT || 8000;



const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))

const authRoutes = require("./routes/authRoutes");
app.use(authRoutes);

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


connectMongoDB();
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
