const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// General API limiter — generous, just stops abuse/scraping
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, 'Too many requests, please try again later')),
});

// Tighter limiter for auth routes — brute-force protection
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => next(new ApiError(429, 'Too many attempts, please try again later')),
});

module.exports = { apiLimiter, authLimiter };