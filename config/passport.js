/* 
 const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;

        if (!email) {
          return done(null, false, { message: "No email found" });
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (user) return done(null, user);

        user = await User.create({
          name: profile.displayName,
          email: email.toLowerCase(),
          googleId: profile.id,
          phoneNumber:'Null'
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);
  */


// passport.js

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

// ---------------- GOOGLE SIGNUP STRATEGY ---------------- //
passport.use(
  "google-signup",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        if (!email) return done(null, false, { message: "no-email" });

        const existingUser = await User.findOne({ email });

        if (existingUser) {
          // Email already exists → prevent duplicate signup
          return done(null, false, { message: "email-already-exist" });
        }

        const newUser = await User.create({
          name: profile.displayName,
          email,
          phoneNumber: null,
          password: null,
          googleId: profile.id,
          loginType: "google",
          profilePic: profile.photos?.[0]?.value || null,
        });

        return done(null, newUser);
      } catch (err) {
        console.error("Error during Google signup:", err);
        return done(err, null);
      }
    }
  )
);

// ---------------- GOOGLE LOGIN STRATEGY ---------------- //
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${process.env.PORT}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0].value;
        if (!email) return done(null, false, { message: "no-email" });

        const existingUser = await User.findOne({ email });

        if (!existingUser) {
          return done(null, false, { message: "acc-not-found" });
        }

        if (existingUser.loginType === "local") {
          return done(null, false, { message: "login-mismatch" });
        }

        return done(null, existingUser);
      } catch (err) {
        console.error("Error during Google login:", err);
        return done(err, null);
      }
    }
  )
);

// ---------------- SERIALIZATION ---------------- //
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
