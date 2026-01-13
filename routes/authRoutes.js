const User = require('../models/user')
const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const {signupValidator,loginValidator} = require('../middleware/validateUser')
const {protectedAuth} = require("../middleware/auth")
const {upload} = require("../middleware/multer")
const passport = require("passport");
const productModel = require('../models/products');
const wishlistModel = require('../models/wishlist');
const cartModel = require('../models/cart');



//---------------------------SIGNUP-----------------------------------------


router.get("/signup", (req, res) => {
    res.render('user/signup', { success: null, error: null });
});

router.post("/signup", signupValidator, authControllers.signupUser);

//----------------------------LOGIN--------------------------------------
router.get("/login", (req, res) => {
    res.render('user/login', { success: null, error: null });
});

//router.post("/login",loginValidator,protectedAuth,authControllers.loginUser);
router.post("/login", loginValidator, authControllers.loginUser);



//---------------------------------------HOME-----------------------------
 /* router.get("/home", (req, res) => {
  
  res.render('user/home', { user: req.user,success:null,error:null }); 
  
}); */
 
/* 
router.get('/home', protectedAuth, (req, res) => {
    res.render("user/home", { user: req.auth,success:null,error:null});
});

 */

router.get("/home", authControllers.loadHome);


//---------------------------------PASSPORT--------------------------------


router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);


router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login?error=auth_failed",
  }),
  (req, res) => {
    res.redirect("/home"); 
  }
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


//-----------------------------------PROFILE------------------------------


router.get('/profile', protectedAuth,authControllers.profilePage)

router.get("/logout", authControllers.logoutUser)

router.get('/editProfile',protectedAuth, authControllers.editProfile)


router.post('/editProfile',protectedAuth, authControllers.updateProfile)

router.post("/uploadProfileImage",protectedAuth,upload.single("profileImage"), authControllers.uploadProfileImage)

router.post("/removeProfileImage", protectedAuth,authControllers.removeProfileImage);

//----------------------------------ADDRESS-----------------------------------

router.get("/address",protectedAuth,authControllers.getaddressPage)
router.post("/address/save",protectedAuth,authControllers.saveAddress)
router.get("/editAddress",protectedAuth,authControllers.editAddress)
router.post('/address/update/:id',protectedAuth,authControllers.updateAddress)


//-----------------------------------------PRODUCT------------------------------------

router.get('/product_list',authControllers.productList)
router.get('/product/:id',authControllers.getSingleProduct)
router.get("/singleProduct",authControllers.getSingleProduct)


//--------------------------------WISHLIST-------------------------

router.get('/wishlist',protectedAuth,authControllers.getWishlist)

router.get('/wishlist/add/:id', protectedAuth, authControllers.addToWishlist)

router.post('/wishlist/remove/:id', protectedAuth, authControllers.removeFromWishlist);

//-----------------------------------------CART----------------------------------

router.get('/cart',protectedAuth,authControllers.getCart)

router.post('/cart/add/:id',protectedAuth,authControllers.addToCart)

router.get('/cart/remove/:id',protectedAuth,authControllers.removeFromCart)

router.get("/cart/increase/:id", protectedAuth, authControllers.increaseQuantity)

router.get("/cart/decrease/:id", protectedAuth, authControllers.decreaseQuantity)

router.get("/checkout",protectedAuth,authControllers.getCheckoutPage)

router.post("/place-order",protectedAuth,authControllers.proceedCheckOut)

router.get("/order/:orderId", protectedAuth, authControllers.orderPage)

//-------------------------------------ABOUT US--------------------------

router.get("/about",authControllers.getAboutPage)

//---------------------------------COUPON--------------------------------------

router.post("/apply-coupon", protectedAuth, authControllers.applyCoupon)

router.get('/cart/coupon-remove', protectedAuth,authControllers.removeCoupon)

router.post('/cart/coupon-remove', protectedAuth,authControllers.removeCoupon)

router.get("/contact",protectedAuth,authControllers.getContactPage)

router.post("/contact",authControllers.postEnquiry)






















module.exports = router;
