const express = require('express');
const protect = require('../middlewares/authMiddleware');
const {
  listMyConversations,
  getOrCreateConversation,
  getMessages,
} = require('../controllers/messageController');

const router = express.Router();
router.use(protect);

router.get('/conversations', listMyConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getMessages);

module.exports = router;