const express = require('express');
const protect = require('../middlewares/authMiddleware');
const { list, readOne, readAll } = require('../controllers/notificationController');

const router = express.Router();
router.use(protect);

router.get('/', list);
router.patch('/:id/read', readOne);
router.patch('/read-all', readAll);

module.exports = router;