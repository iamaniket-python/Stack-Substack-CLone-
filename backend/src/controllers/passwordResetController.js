const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findUserByEmail } = require('../models/userModel');
const { revokeAllUserTokens } = require('../models/refreshTokenModel');
const {
  createResetToken,
  consumeResetToken,
  updateUserPassword,
} = require('../models/passwordResetModel');
const { hashToken } = require('../utils/tokenUtils');
const env = require('../config/env');

const RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Email exist kare ya na kare, jawab hamesha same: account enumeration se bachne ke liye
const GENERIC_MESSAGE =
  'Agar is email se account hai, to password reset link bhej diya gaya hai.';

// Abhi email provider nahi hai: development mein link console mein print hota hai.
// Production mein token kabhi log nahi karte.
const deliverResetLink = async (user, link) => {
  if (!env.isProduction) {
    console.log(`\n[password-reset] ${user.email}\n${link}\n`);
  } else {
    console.warn('[password-reset] Email provider configure nahi hai, link bheja nahi gaya');
  }
};

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await findUserByEmail(email);
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex'); // 64 hex chars
    await createResetToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });
    await deliverResetLink(user, `${FRONTEND_URL}/reset-password/${rawToken}`);
  }

  res.json({ success: true, message: GENERIC_MESSAGE });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const userId = await consumeResetToken(hashToken(token));
  if (!userId) {
    throw new ApiError(400, 'Reset link invalid ya expire ho gaya hai. Naya link mangao.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUserPassword(userId, passwordHash);

  // Saare purane sessions band: agar kisi ne session chura liya tha to woh bhi khatam
  await revokeAllUserTokens(userId);

  res.json({ success: true, message: 'Password badal gaya. Ab naye password se login karo.' });
});

module.exports = { forgotPassword, resetPassword };