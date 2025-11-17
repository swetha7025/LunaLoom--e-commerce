const jwt = require("jsonwebtoken")

function getToken(req){
    return req.cookies?.token||null
}

async function protectedAuth(req,res,next) {
    const token = getToken(req)

    if(!token){
        return res.render('user/login',{success:null,error:'Login again'})
    }

    try {
        const payload = jwt.verify(token,process.env.JWT_SECRET)
        req.auth = payload
        console.log('Token verified');
        next()

    } catch (error) {
        console.error('Token not verified',error.message);
        res.clearCookie('token')
        return res.redirect('/login')
    }
    
}


async function protectedAuthAdmin(req, res, next) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    return res.redirect('/adminLogin');
  }

  try {
    const payload = jwt.verify(adminToken, process.env.JWT_SECRET);
    req.auth = payload;
    next();
  } catch (error) {
    console.error('Token not verified:', error.message);
    res.clearCookie('adminToken');
    return res.redirect('/adminLogin');
  }
}




















module.exports = {
    protectedAuth,
    protectedAuthAdmin
}