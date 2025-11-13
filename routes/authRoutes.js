
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const {signupValidator,loginValidator} = require('../middleware/validateUser')
const {protectedAuth} = require("../middleware/auth")
const passport = require("passport")



//-------------------signup-----------------------------------------


router.get("/signup", (req, res) => {
    res.render('user/signup', { success: null, error: null });
});

router.post("/signup", signupValidator, authControllers.signupUser);

//--------------------login--------------------------------------------
router.get("/login", (req, res) => {
    res.render('user/login', { success: null, error: null });
});

router.post("/login",loginValidator,protectedAuth,authControllers.loginUser);


//---------------------------------------home-----------------------------
 router.get("/home", (req, res) => {
  res.render('user/home', { user: req.user,success:null,error:null }); 
  
});
 

//---------------------------------passport--------------------------------


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed',}),
  (req, res) => {
    
    res.redirect('/home')
  }
);

//----------------------------------------forgot password----------------------


router.get('/forgotPassword',(req,res)=>{
  res.render('user/forgotPassword',{success:null,error:null})
})

router.post('/forgotPassword',authControllers.forgotpassword)

//------------------------------verify otp---------------------------------


router.get('/verify', (req, res) => {
  res.render('user/verify', { success: null, error: null });
});

router.post('/verify', authControllers.verify);


//-------------------------------reset password---------------------------------





























module.exports = router;
