const asyncHandler = require('../utils/asyncHandler');
const { listNotifications, countUnread, markAsRead, markAllAsRead } = require('../models/notificationModel');

const list = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = (page - 1) * limit;

  const notifications = await listNotifications(req.userId, { limit, offset });
  const unreadCount = await countUnread(req.userId);

  res.json({ success: true, data: { notifications, unreadCount, page } });
});

const readOne = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.params.id, req.userId);
  res.json({ success: true, data: { notification } });
});

const readAll = asyncHandler(async (req, res) => {
  await markAllAsRead(req.userId);
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { list, readOne, readAll };