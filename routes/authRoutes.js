
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const {signupValidator,loginValidator} = require('../middleware/validateUser')
const passport = require("passport")
//-------------------signup------------------------------


router.get("/signup", (req, res) => {
    res.render('user/signup', { success: null, error: null });
});

router.post("/signup", signupValidator, authControllers.signupUser);

//--------------------login----------------------
router.get("/login", (req, res) => {
    res.render('user/login', { success: null, error: null });
});

router.post("/login",loginValidator, authControllers.loginUser);


//---------------------------------------home------------------------
 router.get("/home", (req, res) => {
  res.render('user/home', { user: req.user,success:null,error:null }); 
  
});
 

//---------------------------------passport--------------------


router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=already',failureMessage:true }),
  (req, res) => {
    
    res.redirect('/')
  }
);













module.exports = router;
