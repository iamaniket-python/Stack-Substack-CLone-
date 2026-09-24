const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const {
  findOrCreateConversation,
  findConversationById,
  listConversationsForUser,
} = require('../models/conversationModel');
const { listMessages, markMessagesRead } = require('../models/messageModel');

const listMyConversations = asyncHandler(async (req, res) => {
  const conversations = await listConversationsForUser(req.userId);
  res.json({ success: true, data: { conversations } });
});

const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { userId: otherUserId } = req.body;
  if (otherUserId === req.userId) throw new ApiError(400, "Can't message yourself");

  const conversation = await findOrCreateConversation(req.userId, otherUserId);
  res.json({ success: true, data: { conversation } });
});

const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await findConversationById(conversationId);

  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (conversation.user_one_id !== req.userId && conversation.user_two_id !== req.userId) {
    throw new ApiError(403, 'Not part of this conversation');
  }

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const offset = (page - 1) * limit;

  const messages = await listMessages(conversationId, { limit, offset });
  await markMessagesRead(conversationId, req.userId);

  res.json({ success: true, data: { messages } });
});

module.exports = { listMyConversations, getOrCreateConversation, getMessages };