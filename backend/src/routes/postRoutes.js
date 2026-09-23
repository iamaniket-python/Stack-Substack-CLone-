const express = require('express');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuth');
const {
  create,
  feed,
  getBySlug,
  myPosts,
  update,
  remove,
} = require('../controllers/postController');

const router = express.Router();

router.get('/', feed);
router.get('/mine', protect, myPosts);
router.get('/:slug', optionalAuth, getBySlug);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    body('status').optional().isIn(['draft', 'published']),
  ],
  validate,
  create
);

router.patch('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;