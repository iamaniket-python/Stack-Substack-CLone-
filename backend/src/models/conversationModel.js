const { query } = require('../config/db');

// Always insert the smaller UUID first so the pair is order-independent —
// this is what makes ON CONFLICT (user_one_id, user_two_id) actually dedupe correctly.
const sortPair = (a, b) => (a < b ? [a, b] : [b, a]);

const findOrCreateConversation = async (userA, userB) => {
  const [userOne, userTwo] = sortPair(userA, userB);

  const { rows } = await query(
    `INSERT INTO conversations (user_one_id, user_two_id)
     VALUES ($1, $2)
     ON CONFLICT (user_one_id, user_two_id) DO UPDATE SET user_one_id = EXCLUDED.user_one_id
     RETURNING *`,
    [userOne, userTwo]
  );
  return rows[0];
};

const findConversationById = async (id) => {
  const { rows } = await query('SELECT * FROM conversations WHERE id = $1', [id]);
  return rows[0];
};

const listConversationsForUser = async (userId) => {
  const { rows } = await query(
    `SELECT c.*,
       CASE WHEN c.user_one_id = $1 THEN c.user_two_id ELSE c.user_one_id END AS other_user_id,
       u.name AS other_user_name, u.avatar_url AS other_user_avatar,
       (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
       (SELECT COUNT(*)::int FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = FALSE) AS unread_count
     FROM conversations c
     JOIN users u ON u.id = CASE WHEN c.user_one_id = $1 THEN c.user_two_id ELSE c.user_one_id END
     WHERE c.user_one_id = $1 OR c.user_two_id = $1
     ORDER BY c.last_message_at DESC`,
    [userId]
  );
  return rows;
};

const touchConversation = async (id) => {
  await query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [id]);
};

module.exports = { findOrCreateConversation, findConversationById, listConversationsForUser, touchConversation };