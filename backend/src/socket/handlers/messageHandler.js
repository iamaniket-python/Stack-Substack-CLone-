const { createMessage } = require('../../models/messageModel');
const { touchConversation, findConversationById } = require('../../models/conversationModel');

const sendMessageSocketHandler = async (io, socket, payload, callback) => {
  try {
    const { conversationId, content } = payload;

    if (!content || !content.trim()) {
      return callback?.({ success: false, message: 'Message cannot be empty' });
    }

    const conversation = await findConversationById(conversationId);
    if (!conversation) return callback?.({ success: false, message: 'Conversation not found' });

    if (conversation.user_one_id !== socket.userId && conversation.user_two_id !== socket.userId) {
      return callback?.({ success: false, message: 'Not part of this conversation' });
    }

    const message = await createMessage({ conversationId, senderId: socket.userId, content });
    await touchConversation(conversationId);

    const recipientId =
      conversation.user_one_id === socket.userId ? conversation.user_two_id : conversation.user_one_id;

    io.to(conversationId).emit('message:new', message);
    io.to(recipientId).emit('message:new', message);

    // Lazy require — breaks the circular dependency (socket/index → messageHandler →
    // notificationService → socket/index). By the time this function actually runs,
    // every module has finished loading, so this always resolves correctly.
    const { notify } = require('../../services/notificationService');
    await notify({
      recipientId,
      actorId: socket.userId,
      type: 'new_message',
      entityId: message.id,
      message: 'sent you a message',
    });

    callback?.({ success: true, data: message });
  } catch (err) {
    callback?.({ success: false, message: 'Failed to send message' });
  }
};

module.exports = { sendMessageSocketHandler };