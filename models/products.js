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

    brand: {
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
        enum: ['Bedsheet', 'Bedspread', 'Pillows'],
        required: true
    },

    image: {
        type: String,
        trim: true
    },

    reviews: {
        type: String,
        trim: true
    }

}, { timestamps: true });

const productModel = mongoose.model('Product', productSchema);

module.exports = productModel;
