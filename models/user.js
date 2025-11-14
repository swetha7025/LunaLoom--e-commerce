const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
   
    name : {
        required: true,
        type: String,
    },
    email : {
        required : true,
        unique : true,
        type : String,
    },
    phoneNumber : {
        required : function(){return !this.googleId},
        unique : true,
        type : String,
         sparse: true,
    },
    password : {
        required : function(){return !this.googleId},
        type : String,
    },
    isBlock : {
        type : Boolean,
        default : false,
    },
    otp : {
        type : Number,
        otpExpires : Date,
    },
     resetotp: {
      type: String,
      otpExpires: Date,
    },

    googleId :{
        type : String,
        unique : true,
        sparse:true,
    }















},
{timestamps:true}
);


module.exports = mongoose.model('user',userSchema)

