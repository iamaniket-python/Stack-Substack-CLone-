const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/authMiddleware');
const { create, listForPost, remove } = require('../controllers/commentController');

const router = express.Router();

router.get('/post/:postId', listForPost);

router.post(
  '/',
  protect,
  [
    body('postId').isUUID().withMessage('Valid postId is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('parentCommentId').optional().isUUID(),
  ],
  validate,
  create
);

router.delete('/:id', protect, remove);

module.exports = router;