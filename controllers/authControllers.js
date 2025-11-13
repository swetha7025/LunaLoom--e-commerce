const User = require('../models/user')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');

require('dotenv').config();


//-----------------------------signup---------------------------------------
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


//----------------------------------login------------------------------------
async function loginUser(req,res) {

  try {
    
    const {email,password} = req.body

    const user =await User.findOne({email})

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
          phone:user.phone
     },process.env.JWT_SECRET,{expiresIn:'7d'})


     res.cookie('token',token,{
      httpOnly: true,
      secure: process.env.NODE_ENV==='production',
      sameSite: 'strict',
      maxAge: 7*24*60*60*1000,
     })
    
     return res.redirect('/home')



    

  } catch (error) {
    console.error(error)
    return res.render('user/login',{success:null, error : 'Error during login'})
  }
  
}

//-------------------------------forgot password----------------------------------


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


//--------------------------------------verify otp-----------------------------------


async function verify(req, res) {
  const { email, digit1, digit2, digit3, digit4, digit5, digit6 } = req.body;
  const otpJoin = `${digit1}${digit2}${digit3}${digit4}${digit5}${digit6}`;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("user/forgotPassword", { email, success: null, error: "User not found." });
    }

    if (Number(otpJoin) !== user.resetotp) {
      return res.render("user/verify", { email, success: null, error: "Invalid OTP." });
    }

    if (user.otpExpires < new Date()) {
      return res.render("user/verify", { email, success: null, error: "OTP expired." });
    }

    
    return res.render("user/resetPassword", {
      userId: user._id,
      email: user.email,
      success: "OTP verified successfully. You can now reset your password.",
      error: null
    });

  } catch (error) {
    console.error("Error from verifyOtp:", error.message);
    return res.render("user/verify", {
      email,
      success: null,
      error: "Something went wrong. Please try again."
    });
  }
}

//--------------------------------------reset password---------------------------------


















module.exports = {
  signupUser,
  loginUser,
  forgotpassword,
  verify
}