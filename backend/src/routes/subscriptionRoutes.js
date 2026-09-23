const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/authMiddleware');
const {
  subscribe,
  unsubscribe,
  mySubscriptions,
  myPublicationSubscribers,
  subscriptionStatus,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.use(protect); // every subscription route requires auth

router.post(
  '/',
  [body('authorId').isUUID().withMessage('Valid authorId is required')],
  validate,
  subscribe
);

router.delete('/:authorId', unsubscribe);
router.get('/mine', mySubscriptions);
router.get('/subscribers', myPublicationSubscribers);
router.get('/status/:authorId', subscriptionStatus);

module.exports = router;