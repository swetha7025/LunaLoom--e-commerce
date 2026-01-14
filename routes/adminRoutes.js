const express = require('express');
const router = express.Router();
const adminControllers = require("../controllers/adminControllers");
const {protectedAuthAdmin} = require("../middleware/auth")
const {upload} = require('../middleware/multer');
const { route } = require('./authRoutes');


//-------------------------ADMIN LOGIN----------------------------
router.get('/adminlogin', (req, res) => {
  res.render('admin/adminlogin', { success: null, error: null })
})
router.post('/adminlogin',adminControllers.adminLogin)


//-----------------------------DASHBOARD---------------------------

router.get('/dashboard',protectedAuthAdmin,adminControllers.adminDashboard)

//---------------------------------------PRODUCTS------------------------------

router.get("/products", adminControllers.adminProducts);

router.get("/addProducts",adminControllers.addProducts)

router.post("/addProducts", upload.array("images", 10), adminControllers.addProducts);

router.get("/editProducts/:id", adminControllers.editProducts)

router.post("/editProducts/:id", upload.array("images", 4), adminControllers.editProducts);

router.post("/deleteProducts/:id", adminControllers.deleteProduct);

//--------------------------------------------COUPON----------------------------------------

router.get("/coupons",adminControllers.couponPage)

router.get('/coupons/add', adminControllers.getAddCouponPage)

router.post('/addCoupon', adminControllers.addCoupon)

router.get('/coupons/edit/:id', adminControllers.getEditCouponPage)

router.post('/coupons/edit/:id',adminControllers.updateCoupon)

router.post('/coupons/delete/:id',adminControllers.deleteCoupon)

//-----------------------------------------------CUSTOMERS-----------------------------------

router.get("/customers",adminControllers.getCustomersPage)

router.get("/customers/block/:id",adminControllers.blockCustomer)

router.get("/customers/unblock/:id",adminControllers.blockCustomer)

//------------------------------------------------CHART-----------------------------------------

router.get("/admin/pie-chart",adminControllers.pieChart)

router.get("/admin/bar-chart", adminControllers.barChart)

router.get("/admin/line-chart", adminControllers.lineChart)

//---------------------------------------ORDERS----------------------------------------

router.get("/admin-orders",adminControllers.getOrderPage)

router.post("/admin-orders/update/:id", adminControllers.updateOrderStatus)

//-------------------------------------BANNER----------------------------------------

router.get("/banner",adminControllers.getBannerPage)

router.post( "/admin/banners/add", upload.array("bannerImage",4),adminControllers.uploadBanner)

router.post("/admin/banners/delete/:id",adminControllers.deleteBanner)

router.post("/admin/banners/edit/:id", upload.array('bannerImage',4),adminControllers.updateBanner)
 
 router.get("/support",adminControllers.getSupportPage)


























module.exports = router;   
