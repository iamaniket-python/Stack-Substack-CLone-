const express = require('express');
const protect = require('../middlewares/authMiddleware');
const upload = require('../middlewares/upload');
const { create, feed, view, remove } = require('../controllers/storyController');

const router = express.Router();
router.use(protect);

router.post('/', upload.single('media'), create);
router.get('/feed', feed);
router.get('/:id', view);
router.delete('/:id', remove);

module.exports = router;