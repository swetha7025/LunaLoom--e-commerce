
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

//-------------------signup------------------------------


router.get("/signup", (req, res) => {
    res.render('user/signup', { success: null, error: null });
});


router.post("/signup", authControllers.signupUser);

//--------------------login----------------------
router.get("/login", (req, res) => {
    res.render('user/login', { success: null, error: null });
});


router.post("/login", authControllers.loginUser);





module.exports = router;
