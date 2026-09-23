const express = require('express');
const protect = require('../middlewares/authMiddleware');
const optionalAuth = require('../middlewares/optionalAuth');
const { toggle, status } = require('../controllers/likeController');

const router = express.Router();

router.get('/post/:postId', optionalAuth, status);
router.post('/post/:postId', protect, toggle);

module.exports = router;