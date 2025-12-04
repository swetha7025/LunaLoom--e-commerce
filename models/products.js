const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

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

    stock: {
        type: Number,
    },

    brand: {
        type: String,
        required: true,
        trim: true,
    },

    
    sizes: {
        type: [String],
        enum: ['Double', 'Queen', 'King'],
        default: []
    },


    fabrics: {
        type: [String],
        enum: ['Cotton', 'Silk', 'Polyester', 'Bamboo Fabric'],
        default: []
    }

}, { timestamps: true });





const productModel = mongoose.model('Product', productSchema);
module.exports = productModel;
