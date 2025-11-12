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




















module.exports = {
    protectedAuth
}