const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");
const {protectedAuthAdmin} = require("../middleware/auth")
const {upload} = require('../middleware/multer')


//-------------------------ADMIN LOGIN----------------------------
router.get('/adminlogin', (req, res) => {
  res.render('admin/adminlogin', { success: null, error: null });
});

router.post('/adminlogin',adminControllers.adminLogin);


//-----------------------------DASHBOARD---------------------------


router.get('/dashboard',protectedAuthAdmin,adminControllers.adminDashboard)

//---------------------------------------PRODUCTS------------------------------

router.get("/products", adminControllers.adminProducts);

router.get("/addProducts",adminControllers.addProducts)

router.post("/addProducts", upload.array("images", 10), adminControllers.addProducts);



router.get("/editProducts/:id", adminControllers.editProducts);
router.post("/editProducts/:id", upload.array("images", 4), adminControllers.editProducts);


router.post("/deleteProducts/:id", adminControllers.deleteProduct);

//--------------------------------------------COUPON------------------------------

router.get("/coupons",adminControllers.couponPage)


















module.exports = router;   
