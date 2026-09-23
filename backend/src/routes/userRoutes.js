const express = require('express');
const { getProfile, getProfilePosts } = require('../controllers/userController');

const router = express.Router();

router.get('/:id', getProfile);
router.get('/:id/posts', getProfilePosts);

module.exports = router;