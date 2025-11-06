const mongoose = require('mongoose');
const urls = process.env.MONGODB_URI;

async function connectMongoDB() {
    if(!urls){
        throw new Error("MONGODB_URI is not defined in .env file")
    }
    try {
        await mongoose.connect(urls)
        console.log('MongoDB connected successfully')
    } catch (error)
    {
        console.error('MongoDB connection failed:',error.message)
    }
    
}

module.exports = {connectMongoDB};