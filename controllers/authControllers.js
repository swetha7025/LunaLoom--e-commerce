const User = require('../models/user')
const productModel = require('../models/products')
const wishlistModel = require('../models/wishlist')
const cartModel = require('../models/cart')
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


async function profilePage(req, res) {
    try {
        const userId = req.auth?.id;   

        if(!userId){
          return res.redirect('/login')
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.render("user/profile", { user: {}, success: null, error: "User not found" });
        }

        res.render("user/profile", { user, success: null, error: null });

    } catch (error) {
        console.log(error);
        res.render("user/profile", { user: {}, success: null, error: "Something went wrong" });
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






// -------------------------------------- PRODUCT LIST ---------------------------------

async function productList(req, res) {
  try {
    const { category, brand } = req.query;

    let filter = {}

    if (category) {
      filter.category = category
    }

    if (brand) {
      filter.brand = brand
    }

    const products = await productModel.find(filter)

    return res.render("user/product_list", { products,success: null,error: null })
    

  } catch (error) {
    console.log(error);
 
    return res.render("user/product_list", {
      products: [],
      success: null,
      error: 'Error during loading products'
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
    res.render('user/wishlist', {success: null, error: "Something went wrong while removing from wishlist" })
  
  }
}


//------------------------------------------------CART PAGE-------------------------------------------
async function getCart(req,res) {
  try {

    const userId = req.auth?.id

    const cart = await cartModel.findOne({userId}).populate('products.productId', 'name price images')
    
    const total = cart?cart.products.reduce((sum,item)=>{
                  const product = item.productId
                  return sum+product.price*item.quantity
                 },0):0
              
      res.render('user/cart',{cart:cart||{products:[]},total, user : req.user, success:null, error : null })
                              
                             
  } catch (error) {
    
    console.log(error)
    res.render('user/cart',{cart:{products:[]},total:0,user:req.user,success:null,error:'something went wrong'})
  }
  
}

//-----------------------------------------------ADD TO CART-----------------------------------------


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
        userId, products: [{ productId, quantity: 1, price: product.price }]
       
      })

      return res.json({success: true, msg: "Added to cart", alreadyInCart: false})
       
    }

    const existingItem = cart.products.find(
      (item) => item.productId.toString() === productId
    )

    if (existingItem) {

      return res.json({ success: true, msg: "Already in cart",alreadyInCart: true})
      
      
    }

    cart.products.push({ productId, quantity: 1,price: product.price })
    

    await cart.save()

    return res.json({success: true,msg: "Added to cart",alreadyInCart: false})
      
    
  } catch (error) {
    console.log(error)
    return res.json({ success: false, msg: "Something went wrong" })
  }
}


//---------------------------------------------------REMOVE FROM CART-------------------------------

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
  loadHome,
  logoutUser,
  productList,
  getSingleProduct,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getCart,
  addToCart,
  removeFromCart


}