const User = require('../models/user')
const bcrypt = require("bcrypt")



//--------------------------signup-----------------------
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
    return res.render('user/signup',{success : null, error : 'Error registering user'})
  }
  
}


//----------------------------------login-----------------------------
async function loginUser(req,res) {

  try {
    
    const {email,password} = req.body

    const user =await User.findOne({email})

    if(!user){
      return res.render('user/login',{success : null, error : 'User does not exit'})
    }

    if(user.isBlock){
      return res.render('user/login',{success : null, error : 'You are blocked by admin'})
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
      return res.render('user/login',{success : null, error : 'Password do not match'})
    }
    
    return res.redirect('/home')

  } catch (error) {
    console.error(error)
    return res.render('user/login',{success:null, error : 'Error during login'})
  }
  
}

























module.exports = {
  signupUser,
  loginUser
}