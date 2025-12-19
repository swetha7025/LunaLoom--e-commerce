const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
      
    code:{
        type : String,
        required : true,
        unique : true
    },

    discount: {
        type : Number,
        required : true
    },

    expiryDate:{
        type : Date,
        required : true
    },

    status: {
        type : String,
        enum: ['Active', 'Expired'],
        default : 'Active'
    },

}, {timestamps : true} )

 const couponModel = mongoose.model('coupon',couponSchema)

    module.exports = couponModel