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
        required : true,
        unique : true,
        type : Number,
    },
    password : {
        required : true,
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


















},
{timestamps:true}
);


module.exports = mongoose.model('user',userSchema)

