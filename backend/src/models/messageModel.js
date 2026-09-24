const { query } = require('../config/db');

const createMessage = async ({ conversationId, senderId, content }) => {
  const { rows } = await query(
    `INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *`,
    [conversationId, senderId, content]
  );
  return rows[0];
};

const listMessages = async (conversationId, { limit, offset }) => {
  const { rows } = await query(
    `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );
  return rows;
};

const markMessagesRead = async (conversationId, userId) => {
  await query(
    `UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
    [conversationId, userId]
  );
};

module.exports = { createMessage, listMessages, markMessagesRead };