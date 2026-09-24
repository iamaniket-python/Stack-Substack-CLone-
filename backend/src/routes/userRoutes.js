const express = require('express');
const protect = require('../middlewares/authMiddleware');
const { getProfile, getProfilePosts, searchUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/search', protect, searchUsers); // must come before /:id
router.get('/:id', getProfile);
router.get('/:id/posts', getProfilePosts);

module.exports = router;