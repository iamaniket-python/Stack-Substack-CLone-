const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  createUser,
  findUserByEmail,
  findUserById,
} = require('../models/userModel');
const {
  saveRefreshToken,
  findValidToken,
  revokeToken,
} = require('../models/refreshTokenModel');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
} = require('../utils/tokenUtils');
const env = require('../config/env');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const issueTokens = async (res, userId) => {
  const accessToken = signAccessToken(userId);
  const refreshToken = signRefreshToken(userId);

  await saveRefreshToken({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshTokenExpiryDate(),
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  return accessToken;
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ name, email, passwordHash });

  const accessToken = await issueTokens(res, user.id);

  res.status(201).json({ success: true, data: { user, accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const accessToken = await issueTokens(res, user.id);

  const { password_hash, ...safeUser } = user;
  res.json({ success: true, data: { user: safeUser, accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(token);
  const storedToken = await findValidToken(tokenHash);
  if (!storedToken) throw new ApiError(401, 'Refresh token revoked or not found');

  // Rotate: revoke the old one, issue a new pair
  await revokeToken(tokenHash);
  const accessToken = await issueTokens(res, decoded.sub);

  res.json({ success: true, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await revokeToken(hashToken(token));
  }
  res.clearCookie('refreshToken', REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out' });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: { user } });
});

module.exports = { register, login, refresh, logout, getMe };