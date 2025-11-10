const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/user");
const user = require("../models/user");


passport.use(
    new GoogleStrategy(
        {
            clientID:process.env.GOOGLE_CLIENT_ID,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:'http://localhost:'+process.env.PORT+'/auth/google/callback'
        },

      async(accessToken,refreshToken,profile,done)=>{
        try {
            const email =  profile.emails[0].value
              
            if(!email){
                return done(null,false,{message: 'No email found'})
            }

            const existingUser = await User.findOne({email:email.toLowerCase()})
             
            if(existingUser){
                return done(null,false,{message:'User already exist'})
            }

          const newUser = await User.create({
            name: profile.displayName,
            email:email,
            googleId:profile.id,
            
          })
           
          await newUser.save()

          return done(null,newUser)     

        } catch (error) {
            return done(error,null)
        }
      }
    )
)

passport.serializeUser((user,done)=>done(null,user.id))
passport.deserializeUser((id,done)=>User.findById(id).then(user=>done(null,user)))