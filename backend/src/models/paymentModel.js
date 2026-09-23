const { query } = require('../config/db');

const createPaymentOrder = async ({ subscriberId, authorId, razorpayOrderId, amount, currency }) => {
  const { rows } = await query(
    `INSERT INTO payments (subscriber_id, author_id, razorpay_order_id, amount, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [subscriberId, authorId, razorpayOrderId, amount, currency]
  );
  return rows[0];
};

const findPaymentByOrderId = async (razorpayOrderId) => {
  const { rows } = await query('SELECT * FROM payments WHERE razorpay_order_id = $1', [razorpayOrderId]);
  return rows[0];
};

const markPaymentPaid = async (razorpayOrderId, razorpayPaymentId) => {
  const { rows } = await query(
    `UPDATE payments SET status = 'paid', razorpay_payment_id = $2, updated_at = NOW()
     WHERE razorpay_order_id = $1
     RETURNING *`,
    [razorpayOrderId, razorpayPaymentId]
  );
  return rows[0];
};

const markPaymentFailed = async (razorpayOrderId) => {
  await query(
    `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE razorpay_order_id = $1`,
    [razorpayOrderId]
  );
};

module.exports = { createPaymentOrder, findPaymentByOrderId, markPaymentPaid, markPaymentFailed };