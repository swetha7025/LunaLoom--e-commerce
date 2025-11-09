
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const {signupValidator,loginValidator} = require('../middleware/validateUser')

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

 router.get("/home", (req, res) => {
  res.render('user/home', { user: req.user,success:null,error:null }); 
  
});
 

















module.exports = router;
