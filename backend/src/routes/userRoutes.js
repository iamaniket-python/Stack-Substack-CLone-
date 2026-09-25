const express = require('express');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { getProfile, getProfilePosts, searchUsers, updateMyProfile } = require('../controllers/userController');

// IMPORTANT: /me and /search must come BEFORE /:id — same route-order gotcha
// as /posts/mine vs /posts/:slug. Otherwise Express treats "me" as an :id param.
router.patch('/me', protect, upload.single('avatar'), updateMyProfile);
router.get('/search', protect, searchUsers);

router.get('/:id', getProfile);
router.get('/:id/posts', getProfilePosts);

module.exports = router;