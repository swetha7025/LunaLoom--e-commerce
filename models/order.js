const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      items: [
       {
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min:1,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
       },

      ],

      address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "address",
        required: true,
      },

      paymentMethod: {
        type: String,
        enum: ["COD","Card"],
        required: true,
      },

      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },

      orderStatus: {
        type: String,
        enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
        default: "Placed"
      },
},{timestamps : true})



const orderModel = mongoose.model('order', orderSchema)
module.exports = orderModel
