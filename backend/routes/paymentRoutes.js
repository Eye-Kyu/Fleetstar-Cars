const express = require('express');
const router = express.Router();
const { payForBooking, stripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

// Customer initiates payment
router.post('/', protect, payForBooking);



router.post('/webhook', stripeWebhook);

// Stripe webhook (must be public, no auth)
//router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
