const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({

     userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        label: {
            type: String,
            required: true,
            trim: true
        },

        street: {
            type: String,
            required:true,
            trim:true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },
        
        district: {
            type: String,
            required:true,
            trim:true
        },

        country: {
            type: String,
            required: true,
            trim: true,
            default:'india'
        },

        pincode: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        }
}, {timestamps: true})



const addressModel = mongoose.model('address', addressSchema);
module.exports = addressModel;
