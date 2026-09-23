const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const razorpay = require('../config/razorpay');
const env = require('../config/env');
const { findUserById } = require('../models/userModel');
const {
  createPaymentOrder,
  findPaymentByOrderId,
  markPaymentPaid,
  markPaymentFailed,
} = require('../models/paymentModel');
const { createOrReactivateSubscription } = require('../models/subscriptionModel');

const MONTHLY_PRICE_PAISE = 19900; // ₹199/month — hardcode for now, move to per-author pricing later

// Step 1: reader hits this to start checkout
const createOrder = asyncHandler(async (req, res) => {
  const { authorId } = req.body;

  if (authorId === req.userId) throw new ApiError(400, "You can't subscribe to yourself");

  const author = await findUserById(authorId);
  if (!author) throw new ApiError(404, 'Author not found');

  const order = await razorpay.orders.create({
    amount: MONTHLY_PRICE_PAISE,
    currency: 'INR',
    receipt: `sub_${req.userId}_${Date.now()}`,
  });

  await createPaymentOrder({
    subscriberId: req.userId,
    authorId,
    razorpayOrderId: order.id,
    amount: MONTHLY_PRICE_PAISE,
    currency: 'INR',
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.razorpay.keyId, // frontend needs this to open Razorpay checkout
    },
  });
});

// Step 2: frontend calls this after Razorpay checkout succeeds, with the signature it returns
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const payment = await findPaymentByOrderId(razorpay_order_id);
  if (!payment) throw new ApiError(404, 'Order not found');
  if (payment.subscriber_id !== req.userId) throw new ApiError(403, 'Not your order');

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    await markPaymentFailed(razorpay_order_id);
    throw new ApiError(400, 'Payment verification failed');
  }

  await markPaymentPaid(razorpay_order_id, razorpay_payment_id);

  const currentPeriodEnd = new Date();
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

  const subscription = await createOrReactivateSubscription({
    subscriberId: req.userId,
    authorId: payment.author_id,
    tier: 'paid',
    currentPeriodEnd,
  });

  res.json({ success: true, data: { subscription } });
});

// Webhook — Razorpay calls this server-to-server, doesn't go through our auth middleware
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(req.rawBody) // see note below — needs the raw body, not parsed JSON
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new ApiError(400, 'Invalid webhook signature');
  }

  const event = req.body.event;

  if (event === 'payment.failed') {
    const orderId = req.body.payload.payment.entity.order_id;
    await markPaymentFailed(orderId);
  }

  // payment.captured is already handled by verifyPayment on the frontend flow;
  // this webhook is the safety net in case that call never reaches us

  res.json({ status: 'ok' });
});

module.exports = { createOrder, verifyPayment, handleWebhook };