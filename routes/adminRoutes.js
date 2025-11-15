const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");


//-------------------------ADMIN LOGIN----------------------------
router.get('/adminlogin', (req, res) => {
  res.render('admin/adminlogin', { success: null, error: null });
});

router.post('/adminlogin', adminControllers.adminLogin);


//-----------------------------DASHBOARD---------------------------




























module.exports = router;   
