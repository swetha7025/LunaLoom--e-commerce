const express = require('express')

const router = express.Router()

const{protectedAuth} = require('../middleware/auth')

const {getStripePayment,stripeSuccess} = require('../controllers/stripeControllers')

router.get('/order/payment/:orderId',protectedAuth,getStripePayment)



router.get('/order/success/:sessionId', protectedAuth, stripeSuccess);










module.exports =  router