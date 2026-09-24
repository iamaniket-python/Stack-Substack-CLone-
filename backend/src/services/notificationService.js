const { createNotification } = require('../models/notificationModel');
const { getIO } = require('../socket');

const notify = async ({ recipientId, actorId, type, entityId, message }) => {
  const notification = await createNotification({ recipientId, actorId, type, entityId, message });

  try {
    getIO().to(recipientId).emit('notification:new', notification);
  } catch (err) {
    // Socket.io not initialized yet (e.g. a script/migration context) — DB write still succeeded
  }

  return notification;
};

module.exports = { notify };