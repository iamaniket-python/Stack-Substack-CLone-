const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require('../controllers/authController');
const {
  forgotPassword,
  resetPassword,
} = require('../controllers/passwordResetController');

const router = express.Router();

router.post(
  '/register', authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login', authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/forgot-password', authLimiter,
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validate,
  forgotPassword
);

router.post(
  '/reset-password', authLimiter,
  [
    body('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid reset link'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  resetPassword
);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;