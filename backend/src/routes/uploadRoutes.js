const express = require('express');
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { uploadCoverImage, uploadAvatar } = require('../controllers/uploadController');

const router = express.Router();

router.post('/cover', protect, upload.single('image'), uploadCoverImage);
router.post('/avatar', protect, upload.single('image'), uploadAvatar);

module.exports = router;