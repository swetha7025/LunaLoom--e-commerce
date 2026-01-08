const User = require('../models/user')
const productModel = require('../models/products')
const wishlistModel = require('../models/wishlist')
const cartModel = require('../models/cart')
const addressModel = require('../models/address')
const orderModel = require('../models/order')
const couponModel = require("../models/coupon")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');
const user = require('../models/user')

require('dotenv').config();


//-----------------------------SIGN UP---------------------------------------
async function signupUser(req,res) {
  try {
    const {username,email,phone,password,confirmPassword} = req.body

    const existingUser = await User.findOne({email})

    if(existingUser){

      return res.render('user/signup',{success : null, error : 'User already exist'})
    }

    if(password!==confirmPassword){
      return res.render('user/signup',{success : null, error : 'Password not match'})
    }


    const hashedPassword = await bcrypt.hash(password,10)
    const newUser = new User({name:username,email,phoneNumber:phone,password:hashedPassword})

    await newUser.save();
    return res.redirect('/login')



  } catch (error) {
    console.error(error);
   
    return res.render('user/signup', {
     success: null,
     error: [{ msg: 'Error registering user' }]
     });


  }
  
}


//----------------------------------LOGIN------------------------------------
async function loginUser(req,res) {

  try {
    
    const {email,password} = req.body

    // const user =await User.findOne({email})

     const user = await User.findOne({
      $or: [
        { email: email },
        { phoneNumber: email }
      ]
    });

    if(!user){
      return res.render('user/login',{success : null, error : 'User does not exist'})
    }

    if(user.isBlock){
      return res.render('user/login',{success : null, error : 'You are blocked by admin'})
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
      return res.render('user/login',{success : null, error : 'Password does not match'})
    }
    
     const token = jwt.sign({
          id:user._id,
          name:user.name,
          email:user.email,
          googleId:user.googleId,
          phoneNumber:user.phoneNumber
     },process.env.JWT_SECRET,{expiresIn:'7d'})
      
   

     res.cookie('token',token,{
      httpOnly: true,
      secure: process.env.NODE_ENV==='production',
      //sameSite: 'strict',
      maxAge: 7*24*60*60*1000,
     })

     
  
     return res.redirect('/home')

 

  } catch (error) {
    console.error(error)
    return res.render('user/login',{success:null, error : 'Error during login'})
  }
  
}

//-------------------------------FORGOT PASSWORD----------------------------------


async function forgotpassword(req,res) {
  
  const {email} = req.body

  try {
    
       const user = await User.findOne({email})
       if(!user){
        return res.render('user/forgotPassword',{success : null, error : 'User not found'})
       }


      const otp = Math.floor(100000 + Math.random()*900000)
      console.log("Generated OTP:",otp)
      const expiresAt = new Date(Date.now()+5*60*1000)

      user.resetotp = otp
      user.otpExpires = expiresAt
      await user.save();

      const transporter = nodemailer.createTransport({
         host:process.env.EMAIL_HOST,
         port:process.env.EMAIL_PORT,
         secure:true,
         auth:{
          user:process.env.EMAIL_USER,
          pass:process.env.EMAIL_PASS,
         }
      })
       

      await transporter.sendMail({
        from:`"My App" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Your OTP to reset password",
        html:`<p>Your OTP is <b>${otp}</b>.It expires in 5 minutes.</p>`
      })
        
      res.render('user/verify',{email,success:null,error:null})

  } catch (error) {
    console.error('Error forgot password:',error.message,error.stack);
    res.render('user/forgotPassword',{success:null,error:'Failed to send otp. Try again'})
  }
}


//--------------------------------------VERIFY OTP-----------------------------------


async function verify(req, res) {
  const { email, digit1, digit2, digit3, digit4, digit5, digit6 } = req.body;
  const otpJoin = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("user/forgotPassword", { email, success: null, error: "User not found." });
    }

    console.log("Entered OTP:", otpJoin);
    console.log("Stored OTP:", user.resetotp);

    if (otpJoin !== user.resetotp.toString()) {
      return res.render("user/forgotPassword", { email, success: null, error: "Invalid OTP." });
    }

    return res.render("user/resetPassword", {
      userId: user._id,
      email: user.email,
      success: "OTP verified successfully. You can now reset your password.",
      error: null
    });

  } catch (error) {
    console.error("Error from verifyOtp:", error.message);
    return res.render("user/forgotPassword", {
      email,
      success: null,
      error: "Something went wrong. Please try again."
    });
  }
}

//--------------------------------------RESET PASSWORD---------------------------------


async function resetPassword(req,res) {
  const {id,email,password,confirmPassword} = req.body
  
  try {
    if(password!==confirmPassword){
      return res.render('user/resetPassword',{email,id,success:null, error:'Password do not match'})
    }

    const hashedPassword = await bcrypt.hash(password,10)

    const user = await User.findByIdAndUpdate(id,{password:hashedPassword},{new:true})
    res.render('user/login',{success:'Password changed successfully',error:null})  

  
  } catch (error) {
    console.error('Error during reset password:',error.message,error.stack)

    return res.render('user/resetPassword',{email,userId:id,success:null,error:'Something went wrong. Please try again'})
  }
}

//--------------------------------------------------HOME-----------------------------------

async function loadHome(req,res) {

  try {
    
     const token = req.cookies?.token || null

     if(!token){

      return res.render('user/home',{user : null, success : null, error : null})
     }

      const payload = jwt.verify(token,process.env.JWT_SECRET)

      res.render('user/home',{user : payload, success : null, error : null})

      
  } catch (error) {
    
    res.clearCookie("token");

    return res.render('user/home',{user : null, success : null,  error : null})
  }
  
}

//--------------------------------------LOGOUT-------------------------------------

async function logoutUser(req,res) {

  res.clearCookie('token',{httpOnly:true, sameSite : 'strict',})

  res.redirect('/login')
  
}



//---------------------------------------PROFILE----------------------------------------


// async function profilePage(req, res) {
//     try {
//         const userId = req.auth?.id;   

//         if(!userId){
//           return res.redirect('/login')
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.render("user/profile", { user: {}, success: null, error: "User not found" });
//         }

//         res.render("user/profile", { user, success: null, error: null });

//     } catch (error) {
//         console.log(error);
//         res.render("user/profile", { user: {}, success: null, error: "Something went wrong" });
//     }
// }

async function profilePage(req, res) {
  try {
    const userId = req.auth?.id;

    if (!userId) return res.redirect('/login');

    const user = await User.findById(userId);
    if (!user) {
      return res.render('user/profile', {
        user: {},
        address: null,
        orders:[],
        tab: 'orders',
        success: null,
        error: 'User not found'
      });
    }

    
    const address = await addressModel.findOne({ userId });

    const orders = await orderModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.render('user/profile', {
      user,
      address,      
      orders,                
      tab: req.query.tab || 'orders',
      success: null,
      error: null
    })

  } catch (err) {
    console.log(err);
    res.render('user/profile', {
      user: {},
      address: null,
      orders:[],
      tab: 'orders',
      success: null,
      error: 'Something went wrong'
    });
  }
}

//---------------------------------------EDIT PROFILE------------------------------------------

async function editProfile(req, res) {
    try {
         const userId = req.auth?.id; 
        

        const user = await User.findById(userId);

        if (!user) {
            return res.render("user/editProfile", { user: {}, success:null,error : 'User not found' });
        }

        res.render("user/editProfile", { user , success :null, error : null });
    } catch (error) {
        console.log(error);
        res.render("user/editProfile", { user: {}, success:null,error:'Something went wrong' });
    }
} 

//----------------------------------------------UPDATE PROFILE------------------------------------

async function updateProfile(req, res) {
    try {
        const { name, email, phoneNumber } = req.body;

        const user = await User.findByIdAndUpdate(
            req.auth.id,   
            {
                name,
                email,
                phoneNumber
            },
            { new: true }
        );

        return res.redirect('/profile'); 

    } catch (error) {
        console.log(error);
        return res.render("user/editProfile", { user: {}, success: null, error: "Something went wrong" });
    }
}





//-----------------------------------------PROFILE IMAGE-----------------------------

async function uploadProfileImage(req,res) {

  try {
     if(!req.file){

       return res.render("user/profile",{user:req.user, success : null, error : 'Image not founnd'})
     }

     const profilePhoto = `/img/${req.file.filename}`

     await User.findByIdAndUpdate(req.auth.id,{profileImage:profilePhoto},{new:true})

     return res.redirect("/profile")



  } catch (error) {
    console.log(error)
    res.render("user/profile",{user : req.user, success : null, error : 'Something went wrong'})
  }
  
}

async function removeProfileImage(req, res) {
  try {
    await User.findByIdAndUpdate(
      req.auth.id,
      { profileImage: null },
      { new: true }
    );

    return res.redirect("/profile");
  } catch (error) {
    console.log(error);
    return res.render("user/profile", {
      user: req.user,
      success: null,
      error: "Unable to remove profile photo"
    });
  }
}

//-------------------------------------------------ADDRESS PAGE-----------------------------

async function getaddressPage(req,res) {

  try {
  
     const userId = req.auth?.id

     if(!userId){
      return res.redirect('/login')
     }

    const user = await User.findById(userId)

    if(!user){
       return res.render('user/profile',{user:{},address:null,tab:'address',success:null,error:'User not found'})

    }
    const address = await addressModel.findOne({userId})
    res.render('user/profile',{user,address,tab:'address',success:null,error:null})
     
  } catch (error) {
    console.log(error)
    res.render('user/profile',{user:{},address:null,tab:'address',success:null, error:'Something went wrong'})
    
  }
}

//----------------------------------SAVE ADDRESS------------------------------------

async function saveAddress(req,res) {
  try {
    const {label,street,city,district,country,pincode,phone} = req.body  

    const userId = req.auth?.id
    
    if(!userId){
      return res.redirect('/login')
    }
      
    await addressModel.create({userId,label,street,city,district,country,pincode,phone})
     
    return res.redirect('/address')

  } catch (error) {
    console.log(error)
    res,redirect('/address')
  }
  
}

//---------------------------------EDIT ADDRESS----------------------------------------

async function editAddress(req, res) {
  try {
    const userId = req.auth?.id

    if (!userId) {
      return res.redirect('/login')
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.render("user/editAddress", { user: {}, address: null, success: null, error: "User not found"  })
      
    }

    const address = await addressModel.findOne({ userId })

    if (!address) {
      return res.render("user/editAddress", { user,address: null, success: null, error: "Address not found" })
    }

    res.render("user/editAddress", { user,address,success: null, error: null })
      
  } catch (error) {
    console.log(error)
    res.render("user/editAddress", { user: {}, address: null, success: null, error: "Something went wrong" })
  }
}

//-----------------------------------UPDATE ADDRESS----------------------------------

async function updateAddress(req,res) {
  try {
     const {label,street,city,district,country,pincode,phone} = req.body  

     const userId =  req.auth?.id
     const addressId = req.params.id;
     await addressModel.findByIdAndUpdate( { _id: addressId, userId },{label,street,city,district,country,pincode,phone},{new:true})
   
    return res.redirect('/address')

  } catch (error) {
    console.log(error)
    return res.redirect('/address')
    
  }
  
}

// -------------------------------------- PRODUCT LIST ---------------------------------

// async function productList(req, res) {
//   try {
//     const { category, brand, } = req.query;

//     let filter = {}

//     if (category) {
//       filter.category = category
//     }

//     if (brand) {
//       filter.brand = brand
//     }

    

//     const products = await productModel.find(filter)

//     return res.render("user/product_list", { products,category,success: null,error: null })
    

//   } catch (error) {
//     console.log(error);
 
//     return res.render("user/product_list", {
//       products: [],
//       category:null,
//       success: null,
//       error: 'Error during loading products'
//     });
//   }
// }
async function productList(req, res) {
  try {
    const { category, brand, page } = req.query;

    const currentPage = parseInt(page) || 1;
    const limit = 6;
    const skip = (currentPage - 1) * limit;

    let filter = {};

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    
    const totalProducts = await productModel.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

  
    const products = await productModel
      .find(filter)
      .skip(skip)
      .limit(limit);

    return res.render("user/product_list", {
      products,
      category,
      brand,
      currentPage,
      totalPages,
      success: null,
      error: null
    });

  } catch (error) {
    console.log(error);

    return res.render("user/product_list", {
      products: [],
      category: null,
      brand: null,
      currentPage: 1,
      totalPages: 0,
      success: null,
      error: "Error during loading products"
    });
  }
}



// ------------------------------------------ SINGLE PRODUCT -----------------------------------

async function getSingleProduct(req, res) {
  try {
    const productId = req.params.id

    const product = await productModel.findById(productId)

    if (!product) {
      return res.render("user/product_list", { product: null,success: null, error: 'Product not found' })
       
    }

    return res.render("user/singleProduct", {product,success: null,error: null})
     

  } catch (error) {
    console.log(error);

    return res.render("user/singleProduct", {
      product: null,
      success: null,
      error: 'Something went wrong'
    });
  }
}


//-------------------------------------WISHLIST------------------------------------


async function getWishlist(req,res) {
    try {
      
      const userId = req.auth?.id

      const wishlist = await wishlistModel.findOne({userId}).populate('products.productId', 'name price images ')


      res.render('user/wishlist',{wishlist, success:null,error:null})

    } catch (error) {
      
      console.log(error)
      res.render('user/wishlist',{wishlist:null, success:null,error:'something went wrong'})
    }
  
}

//------------------------------------------ADD TO WISHLIST--------------------------------

// async function addToWishlist(req,res) {
//   try {
  
//     const userId = req.auth?.id
//     const productId = req.params.id

//     let wishlist = await wishlistModel.findOne({userId})

//     if(!wishlist){

//       wishlist = new wishlistModel({userId,products:[]})
//     }

//     const exist = wishlist.products.find(p=>p.productId.toString()===productId)

//     if(!exist){
    
//       wishlist.products.push({productId})
//       await wishlist.save()
//     }

//     res.redirect('/wishlist')
  

//   } catch (error) {
//     console.log(error)
//     res.render('user/wishlist',{success:null,error:'Somthing went wrong while adding to wishlist'})
//   }
  
// }


async function addToWishlist(req, res) {
  try {
    const userId = req.auth?.id
    const productId = req.params.id

    let wishlist = await wishlistModel.findOne({ userId })

    if (!wishlist) {
      wishlist = new wishlistModel({ userId, products: [] })
    }

    const exist = wishlist.products.find(p => p.productId.toString() === productId)

    if (exist) {
      return res.json({ success: true, exists: true, message: "Product already in wishlist" })
      
    }

    wishlist.products.push({ productId })
    await wishlist.save()

    return res.json({ success: true, exists: false, message: "Product added to wishlist"})
     
     
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: "Something went wrong" })
     
  }
}


//---------------------------------------REMOVE WISHLIST------------------------------------


async function removeFromWishlist(req, res) {
  try {
    const userId = req.auth?.id
    const productId = req.params.id

    let wishlist = await wishlistModel.findOne({ userId })

    if (!wishlist) {
      return res.redirect('/wishlist')
    }

    wishlist.products = wishlist.products.filter(

      (p) => p.productId.toString() !== productId
    )

    await wishlist.save()

    res.redirect('/wishlist')

  } catch (error) {
    console.log(error)
    res.render('user/wishlist', {success: null, error: "Something went wrong " })
  
  }
}


//------------------------------------------------CART PAGE-------------------------------------------

async function getCart(req, res) {
  try {
    const userId = req.auth?.id

    const cart = await cartModel
      .findOne({ userId })
      .populate('products.productId', 'name price images')

    const subtotal = cart
      ? cart.products.reduce((sum, item) => {
          return sum + item.productId.price * item.quantity
        }, 0)
      : 0

    let discountAmount = 0
    if (cart?.couponApplied && cart.couponDiscount) {
      discountAmount = Math.round((subtotal * cart.couponDiscount) / 100)
    }

    const finalTotal = subtotal - discountAmount
  res.render('user/cart', {
  cart: cart || { products: [] },
  subtotal,
  discountAmount,
  total: finalTotal,   
  user: req.user,
  success: null,
  error: null,
  couponMessage: req.query.couponMessage || null,
  couponSuccess: req.query.couponSuccess || null
})

  } catch (error) {
    console.log(error)
    res.render('user/cart', {
      cart: { products: [] },
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      user: req.user,
      success:null,
      error:'something went wrong',
      couponMessage: null,
      couponSuccess: null
    })
  }
}


//-----------------------------------------------ADD TO CART-------------------------------------------


// async function addToCart(req, res) {
//   try {
//     const userId = req.auth?.id
//     const productId = req.params.id

    
//     const product = await productModel.findById(productId)
//     if (!product) {
//       return res.redirect('/product_list')
//     }

    
//     let cart = await cartModel.findOne({ userId })
    
//     if (!cart) {
//       await cartModel.create({

//         userId, products: [ {productId, quantity: 1, price: product.price }]
       
//       })

//       return res.redirect("/cart");
//     }

    
//     const existingItem = cart.products.find(
//       (item) => item.productId.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += 1
//     } else {

//       cart.products.push({ productId, quantity: 1, price: product.price})
       
//     }

//     await cart.save();
//     return res.redirect("/cart")

//   } catch (error) {
//     console.log(error)
//     return res.redirect("/cart")
//   }
// }

// async function addToCart(req, res) {
//   try {
//     const userId = req.auth?.id
//     const productId = req.params.id

//     const product = await productModel.findById(productId)
//     if (!product) {
//       return res.json({ success: false, msg: "Product not found" })
//     }

//     let cart = await cartModel.findOne({ userId })

//     if (!cart) {
//       await cartModel.create({
//         userId, products: [{ productId, quantity: 1, price: product.price }]
       
//       })

//       return res.json({success: true, msg: "Added to cart", alreadyInCart: false})
       
//     }

//     const existingItem = cart.products.find(
//       (item) => item.productId.toString() === productId
//     )

//     if (existingItem) {

//       return res.json({ success: true, msg: "Already in cart",alreadyInCart: true})
      
//     }

//     cart.products.push({ productId, quantity: 1,price: product.price })
    
//     await cart.save()

//     return res.json({success: true,msg: "Added to cart",alreadyInCart: false})
      
    
//   } catch (error) {
//     console.log(error)
//     return res.json({ success: false, msg: "Something went wrong" })
//   }
// }

async function addToCart(req, res) {
  try {
    const userId = req.auth?.id
    const productId = req.params.id

    const product = await productModel.findById(productId)
    if (!product) {
      return res.json({ success: false, msg: "Product not found" })
    }

    let cart = await cartModel.findOne({ userId })

    
    if (!cart) {
      await cartModel.create({
        userId,
        products: [{
          productId,
          quantity: 1,
          price: product.price
        }],
        couponApplied: false,
        couponCode: null,
        couponDiscount: 0
      })

      return res.json({
        success: true,
        msg: "Added to cart",
        alreadyInCart: false
      })
    }

    
    const existingItem = cart.products.find(
      item => item.productId.toString() === productId
    )

    if (existingItem) {
      return res.json({
        success: true,
        msg: "Already in cart",
        alreadyInCart: true
      })
    }

    
    if (cart.couponApplied) {
      cart.couponApplied = false
      cart.couponCode = null
      cart.couponDiscount = 0
    }

    
    cart.products.push({
      productId,
      quantity: 1,
      price: product.price
    })

    await cart.save()

    return res.json({
      success: true,
      msg: "Added to cart",
      alreadyInCart: false
    })

  } catch (error) {
    console.log("Add To Cart Error:", error)
    return res.json({ success: false, msg: "Something went wrong" })
  }
}


//---------------------------------------------------REMOVE FROM CART------------------------------------

async function removeFromCart(req, res) {
  try {

    const userId = req.auth?.id

    const productId = req.params.id
    
    let cart = await cartModel.findOne({ userId })

    if (!cart) {
      return res.redirect('/cart')
    }

    cart.products = cart.products.filter(item => item.productId.toString() !== productId)

    await cart.save()

    return res.redirect('/cart')

  } catch (error) {
    console.log("Remove from cart error:", error)
    return res.redirect('/cart')
  }
}


//----------------------------------------------INCREASE QUANTITY-----------------------------------


// async function increaseQuantity(req, res) {
//   try {
//     const userId =req.auth?.id   
//     const productId = req.params.id

//     const cart = await cartModel.findOne({ userId })
//     if (!cart) return res.redirect("/cart")

//     const product = cart.products.find(
//       item => item.productId.toString() === productId
//     );

//     if (product) {
//       product.quantity += 1;
//     }

//     await cart.save();
//     return res.redirect("/cart");

//   } catch (error) {
//     console.error("increaseQuantity error:", error)
//     return res.redirect("/cart")
//   }
// }


// async function decreaseQuantity(req, res) {
//   try {
//     const userId = req.auth?.id
//     const productId = req.params.id

//     if (!userId) return res.redirect("/login")

//     const cart = await cartModel.findOne({ userId })
//     if (!cart) return res.redirect("/cart")

//     const productIndex = cart.products.findIndex(
//       item => item.productId.toString() === productId
//     );

//     if (productIndex !== -1) {
//       if (cart.products[productIndex].quantity > 1) {
//         cart.products[productIndex].quantity -= 1
//       } else {
//         // remove item if quantity reaches 0
//         cart.products.splice(productIndex, 1)
//       }
//     }

//     await cart.save()
//     return res.redirect("/cart")

//   } catch (error) {
//     console.error("decreaseQuantity error:", error)
//     return res.redirect("/cart")
//   }
// }

async function increaseQuantity(req, res) {
  try {
    const userId = req.auth?.id
    const productId = req.params.id

    if (!userId) {
      return res.json({ success: false, message: "Not logged in" })
    }

    const cart = await cartModel.findOne({ userId }) .populate("products.productId")
    
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" })
    }

    const product = cart.products.find(
      item => item.productId._id.toString() === productId
    )

    if (!product) {
      return res.json({ success: false, message: "Product not found" })
    }

    product.quantity += 1
    await cart.save()

      const subtotal = cart.products.reduce((sum, item) => {
      return sum + item.quantity * item.productId.price
      }, 0)

    const itemTotal = product.quantity * product.productId.price;

    return res.json({success: true,quantity: product.quantity,itemTotal, subtotal })
      
  } catch (error) {
    console.error("increaseQuantity error:", error)
    return res.json({ success: false, message: "Server error" })
  }
}

//--------------------------------------DECREASE QUANTITY-------------------------------------


async function decreaseQuantity(req, res) {
  try {
    const userId = req.auth?.id
    const productId = req.params.id

    if (!userId) {
      return res.json({ success: false, message: "Not logged in" })
    }

    const cart = await cartModel.findOne({ userId }) .populate("products.productId")

    if (!cart) {
      return res.json({ success: false, message: "Cart not found" })
    }

    const index = cart.products.findIndex(
      item => item.productId._id.toString() === productId
    )

    if (index === -1) {
      return res.json({ success: false, message: "Product not found" })
    }

    let removed = false
    let quantity = 0
    let itemTotal = 0

    if (cart.products[index].quantity > 1) {
      cart.products[index].quantity -= 1
      quantity = cart.products[index].quantity
      itemTotal = quantity * cart.products[index].productId.price
    } else {
      cart.products.splice(index, 1)
      removed = true
    }

    await cart.save()

      const subtotal = cart.products.reduce((sum, item) => {
        return sum + item.quantity * item.productId.price
    }, 0)

    return res.json({success: true, quantity, itemTotal,  subtotal, removed })
      
  } catch (error) {
    console.error("decreaseQuantity error:", error)
    return res.json({ success: false, message: "Server error" })
  }
}


//---------------------------------------------CHECK OUT----------------------------------------

async function getCheckoutPage(req, res) {
  try {
    const userId = req.auth?.id
    if (!userId) return res.redirect('/login')

    const user = await User.findById(userId).lean()
    const addresses = await addressModel.find({ userId }).lean()
    const cart = await cartModel.findOne({ userId })
      .populate("products.productId")
      .lean()

    if (!cart) return res.redirect('/cart')

    let subtotal = 0

    const cartItems = cart.products.map(item => {
      const itemTotal = item.productId.price * item.quantity
      subtotal += itemTotal

      return {
        product: { name: item.productId.name },
        quantity: item.quantity,
        total: itemTotal
      }
    })

    let discountAmount = 0
    if (cart.couponApplied && cart.couponDiscount) {
      discountAmount = Math.round((subtotal * cart.couponDiscount) / 100)
    }
    const finalTotal = subtotal - discountAmount

    res.render("user/checkout", {
      user,
      addresses,
      cartItems,
      cart,
      subtotal,
      discountAmount,
      total:finalTotal,
      appliedCoupon: cart.couponCode,
      success: null,
      error: null
    })
  } catch (error) {
    console.log(error)
    return res.redirect('/checkout')
  }
}


//----------------------------------------------PLACE ORDER --- CASH ON DELIVERY----------------------------

async function proceedCheckOut(req, res) {
  try {
    const userId = req.auth?.id
    if (!userId) return res.redirect("/login")

    const { addressId, paymentMethod } = req.body

    const user = await User.findById(userId).lean()
    const addresses = await addressModel.find({ userId }).lean()

    const cart = await cartModel.findOne({ userId }).populate("products.productId").lean()

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.render("user/checkout", {
        user,
        addresses,
        cartItems: [],
        subtotal: 0,
        total: 0,
        success: null,
        error: "Cart is empty"
      });
    }

    const address = await addressModel.findById(addressId).lean();
    if (!address) {
      return res.render("user/checkout", {
        user,
        addresses,
        cartItems: [],
        subtotal: 0,
        total: 0,
        success: null,
        error: "Invalid address selected"
      });
    }

    
    let subtotal = 0;
    const orderItems = cart.products.map(p => {
      const itemTotal = p.productId.price * p.quantity;
      subtotal += itemTotal;

      return {
        product: p.productId._id,
        quantity: p.quantity,
        price: p.productId.price
      };
    });

    
    let totalAmount = subtotal
    let appliedCoupon = null

    if (cart.couponApplied && cart.couponDiscount) {
      const discountAmount = Math.round((subtotal * cart.couponDiscount) / 100);
      totalAmount = subtotal - discountAmount;
      appliedCoupon = {
        code: cart.couponCode,
        discount: cart.couponDiscount,
        discountAmount
      };
    }

    const order = await orderModel.create({
      userId,
      items: orderItems,
      address: addressId,
      paymentMethod,
      totalAmount,
      coupon: appliedCoupon
    });

   
    await cartModel.updateOne({ userId }, {
      $set: {
        products: [],
        couponApplied: false,
        couponCode: null,
        couponDiscount: 0
      }
    });

    
    return res.redirect(`/order/${order._id}`);
  } catch (error) {
    console.log("Checkout Error:", error);
    return res.redirect("/checkout");
  }
}

//--------------------------------------------------ORDER PAGE------------------------------------


const orderPage = async (req, res) => {
  try {
    const userId = req.auth?.id            
    const orderId = req.params.orderId   

    const order = await orderModel.findOne({ _id: orderId, userId }).populate("items.product").populate("address").lean()
      
    if (!order) {
      return res.render("user/order", {success: false, error: "Order not found"})
       
    }

    res.render("user/order", {success: true, error: null, order, userName: req.auth.name})
     
    
  } catch (error) {
    console.error(error)
    res.render("user/order", {
      success: false,
      error: "Failed to load order confirmation",
    })
  }
}

//----------------------------------------------ABOUT PAGE-------------------------------------

async function getAboutPage(req,res) {
  try {
    
    res.render("user/about",{success:null,error:null})
  } catch (error) {
    console.log(error)
    res.render("user/about",{success:null,error:"Something went wrong"})
  }
  
}

//-----------------------------------------APPLY COUPON---------------------------------------

async function applyCoupon(req,res) {
   
  try {
    const { couponCode } = req.body
    const userId = req.auth.id

    if (!couponCode) {
      return res.redirect('/checkout?couponMessage=Please enter a coupon code&couponSuccess=false')
      
    }

    const coupon = await couponModel.findOne({
      code: couponCode.trim(),
      status: 'Active',
      expiryDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.redirect('/cart?couponMessage=Invalid or expired coupon&couponSuccess=false')
    }

    const cart = await cartModel.findOne({ userId })
    if (!cart) {
      return res.redirect('/cart?couponMessage=Cart is empty&couponSuccess=false')
    }

    if (cart.couponApplied && cart.couponCode === coupon.code) {
      return res.redirect('/cart?couponMessage=Coupon already applied&couponSuccess=false')
    }

    cart.couponApplied = true
    cart.couponCode = coupon.code
    cart.couponDiscount = coupon.discount
    await cart.save()

    return res.redirect('/cart?couponMessage=Coupon applied successfully!&couponSuccess=true')

  } catch (error) {
    console.error("Apply Coupon Error:", error)
    return res.redirect('/cart?couponMessage=Something went wrong&couponSuccess=false')
  }
}









 





















































module.exports = {
  signupUser,
  loginUser,
  forgotpassword,
  verify,
  resetPassword,
  profilePage,
  editProfile,
  updateProfile,
  uploadProfileImage,
  removeProfileImage,
  getaddressPage,
  saveAddress,
  editAddress,
  updateAddress,
  loadHome,
  logoutUser,
  productList,
  getSingleProduct,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  getCheckoutPage,
  proceedCheckOut,
  orderPage,
  getAboutPage,
  applyCoupon

}