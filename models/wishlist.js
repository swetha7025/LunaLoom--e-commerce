const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",  // ✔ MUST MATCH model name in product model
                required: true
            }
        }
    ]

}, { timestamps: true });

const wishlistModel = mongoose.model('whislist', wishlistSchema)

module.exports = wishlistModel
