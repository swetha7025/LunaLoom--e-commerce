
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const {signupValidator,loginValidator} = require('../middleware/validateUser')
const {protectedAuth} = require("../middleware/auth")
const passport = require("passport")



//---------------------------SIGNUP-----------------------------------------


router.get("/signup", (req, res) => {
    res.render('user/signup', { success: null, error: null });
});

router.post("/signup", signupValidator, authControllers.signupUser);

//----------------------------LOGIN--------------------------------------
router.get("/login", (req, res) => {
    res.render('user/login', { success: null, error: null });
});

router.post("/login",loginValidator,protectedAuth,authControllers.loginUser);


//---------------------------------------HOME-----------------------------
 router.get("/home", (req, res) => {
  res.render('user/home', { user: req.user,success:null,error:null }); 
  
});
 

//---------------------------------PASSPORT--------------------------------


// ---- GOOGLE SIGNUP ----
router.get(
  "/auth/google/signup",
  passport.authenticate("google-signup", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/signup/callback",
  passport.authenticate("google-signup", {
    failureRedirect: "/signup?error=google_signup_failed",
  }),
  (req, res, next) => {
    req.login(req.user, (err) => {
      if (err) return next(err);
      res.redirect("/home");
    });
  }
);

// ---- GOOGLE LOGIN ----
router.get(
  "/auth/google/login",
  passport.authenticate("google-login", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/login/callback",
  passport.authenticate("google-login", {
    failureRedirect: "/login?error=google_login_failed",
    successRedirect: "/home",
  })
);


//----------------------------------------FORGOT PASSWORD----------------------


router.get('/forgotPassword',(req,res)=>{
  res.render('user/forgotPassword',{success:null,error:null})
})

router.post('/forgotPassword',authControllers.forgotpassword)

//------------------------------VERIFY OTP---------------------------------


router.get('/verify', (req, res) => {
  res.render('user/verify', { success: null, error: null });
});

router.post('/verify', authControllers.verify);


//-------------------------------RESET PASSWORD---------------------------------


router.get('/resetPassword',(req,res)=>{
  res.render('user/resetPassword',{success : null, error : null})
})

router.post('/resetPassword',authControllers.resetPassword)
























module.exports = router;
