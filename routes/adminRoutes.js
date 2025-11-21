const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");
const {protectedAuthAdmin} = require("../middleware/auth")


//-------------------------ADMIN LOGIN----------------------------
router.get('/adminlogin', (req, res) => {
  res.render('admin/adminlogin', { success: null, error: null });
});

router.post('/adminlogin',adminControllers.adminLogin);


//-----------------------------DASHBOARD---------------------------


router.get('/dashboard',protectedAuthAdmin,adminControllers.adminDashboard)


router.get("/products", adminControllers.adminProducts);

























module.exports = router;   
