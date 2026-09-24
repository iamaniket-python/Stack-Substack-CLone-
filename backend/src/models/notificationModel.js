const { query } = require('../config/db');

const createNotification = async ({ recipientId, actorId, type, entityId, message }) => {
  const { rows } = await query(
    `INSERT INTO notifications (recipient_id, actor_id, type, entity_id, message)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [recipientId, actorId, type, entityId, message]
  );
  return rows[0];
};

const listNotifications = async (userId, { limit, offset }) => {
  const { rows } = await query(
    `SELECT n.*, u.name AS actor_name, u.avatar_url AS actor_avatar
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.recipient_id = $1
     ORDER BY n.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

const countUnread = async (userId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE recipient_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return rows[0].count;
};

const markAsRead = async (id, userId) => {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND recipient_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0];
};

const markAllAsRead = async (userId) => {
  await query(`UPDATE notifications SET is_read = TRUE WHERE recipient_id = $1 AND is_read = FALSE`, [userId]);
};

module.exports = { createNotification, listNotifications, countUnread, markAsRead, markAllAsRead };