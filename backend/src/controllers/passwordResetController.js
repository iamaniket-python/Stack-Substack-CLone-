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

const GENERIC_MESSAGE =
  'Agar is email se account hai, to password reset link bhej diya gaya hai.';

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
    const rawToken = crypto.randomBytes(32).toString('hex');
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
  await revokeAllUserTokens(userId);

  res.json({ success: true, message: 'Password badal gaya. Ab naye password se login karo.' });
});

// TEMPORARY: email verification ke bina direct reset.
// Sirf tab chalta hai jab ALLOW_DIRECT_RESET=true ho. Real email aane par ye env hata do.
const directResetPassword = asyncHandler(async (req, res) => {
  if (process.env.ALLOW_DIRECT_RESET !== 'true') {
    throw new ApiError(403, 'Direct password reset band hai');
  }

  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(404, 'Is email se koi account nahi mila');

  const passwordHash = await bcrypt.hash(password, 12);
  await updateUserPassword(user.id, passwordHash);
  await revokeAllUserTokens(user.id);

  res.json({ success: true, message: 'Password badal gaya. Ab naye password se login karo.' });
});

module.exports = { forgotPassword, resetPassword, directResetPassword };