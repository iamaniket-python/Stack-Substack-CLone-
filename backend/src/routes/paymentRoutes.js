const express = require('express');
const protect = require('../middlewares/authMiddleware');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', handleWebhook); // no `protect` — Razorpay isn't an authenticated user

module.exports = router;