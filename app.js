 const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const passport = require("passport")
const session = require("express-session");
const flash = require("connect-flash");



require("./config/passport")

const { connectMongoDB } = require("./config/db");
const PORT = process.env.PORT || 8000;

const app = express()

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
})) 

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stripeRoutes = require('./routes/stripeRoutes');

app.use(authRoutes);
app.use(adminRoutes);

app.use('/', stripeRoutes);



connectMongoDB();
app.listen(PORT, ()=> console.log(`Server is running on port ${PORT}`));
 

