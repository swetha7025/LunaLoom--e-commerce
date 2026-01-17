const express = require('express');
const router = express.Router();

const { stripeWebhook } = require('../controllers/stripeControllers');


router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
