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

    embedding: {
        type: [Number],
        default: []
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
    },

    averageRate: {
    type: Number,
    default: 0
   },

    totalReviews: {
    type: Number,
    default: 0
   },

   reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]


   


}, { timestamps: true });





const productModel = mongoose.model('Product', productSchema);
module.exports = productModel;
