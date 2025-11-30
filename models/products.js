const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    // description: {
    //     type: String,
    //     required: true,
    //     trim: true,
    // },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    
    status: {
        type: String,
        enum: ['Available', 'Not available'],
        default: 'Available',
    },

    category: {
        type: String,
        enum: ['Bedding', 'Pillows & Cushions'],
        required: true
    },

    images: {

       type: [String],  
       default: [],
    },

    reviews: {
        type: String,
        trim: true
    },

    stock : {
        type : Number,
      
    }



}, { timestamps: true });









const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
