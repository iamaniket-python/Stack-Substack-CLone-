const { createMessage } = require('../../models/messageModel');
const { touchConversation, findConversationById } = require('../../models/conversationModel');
const { notify } = require('../../services/notificationService');

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

    // Emit to both the conversation room (if joined) and the recipient's personal
    // room (covers the case where they haven't opened this conversation yet)
    io.to(conversationId).emit('message:new', message);
    io.to(recipientId).emit('message:new', message);

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