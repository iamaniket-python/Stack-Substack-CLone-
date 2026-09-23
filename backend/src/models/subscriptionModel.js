const { query } = require('../config/db');

const hasActivePaidSubscription = async (subscriberId, authorId) => {
  const { rows } = await query(
    `SELECT id FROM subscriptions
     WHERE subscriber_id = $1 AND author_id = $2
       AND tier = 'paid' AND status = 'active'
       AND (current_period_end IS NULL OR current_period_end > NOW())`,
    [subscriberId, authorId]
  );
  return rows.length > 0;
};

const findSubscription = async (subscriberId, authorId) => {
  const { rows } = await query(
    `SELECT * FROM subscriptions WHERE subscriber_id = $1 AND author_id = $2`,
    [subscriberId, authorId]
  );
  return rows[0];
};

// Upsert: if a row already exists (e.g. previously cancelled), reactivate it
// instead of violating the UNIQUE(subscriber_id, author_id) constraint
const createOrReactivateSubscription = async ({ subscriberId, authorId, tier, currentPeriodEnd = null }) => {
  const { rows } = await query(
    `INSERT INTO subscriptions (subscriber_id, author_id, tier, status, current_period_end)
     VALUES ($1, $2, $3, 'active', $4)
     ON CONFLICT (subscriber_id, author_id)
     DO UPDATE SET tier = $3, status = 'active', current_period_end = $4, updated_at = NOW()
     RETURNING *`,
    [subscriberId, authorId, tier, currentPeriodEnd]
  );
  return rows[0];
};

const cancelSubscription = async (subscriberId, authorId) => {
  const { rows } = await query(
    `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW()
     WHERE subscriber_id = $1 AND author_id = $2
     RETURNING *`,
    [subscriberId, authorId]
  );
  return rows[0];
};

const listSubscriptionsForUser = async (subscriberId) => {
  const { rows } = await query(
    `SELECT s.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM subscriptions s
     JOIN users u ON u.id = s.author_id
     WHERE s.subscriber_id = $1 AND s.status = 'active'
     ORDER BY s.created_at DESC`,
    [subscriberId]
  );
  return rows;
};

const listSubscribersForAuthor = async (authorId) => {
  const { rows } = await query(
    `SELECT s.*, u.name AS subscriber_name, u.avatar_url AS subscriber_avatar
     FROM subscriptions s
     JOIN users u ON u.id = s.subscriber_id
     WHERE s.author_id = $1 AND s.status = 'active'
     ORDER BY s.created_at DESC`,
    [authorId]
  );
  return rows;
};

const countActiveSubscribers = async (authorId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM subscriptions
     WHERE author_id = $1 AND status = 'active'`,
    [authorId]
  );
  return rows[0].count;
};

module.exports = {
  hasActivePaidSubscription,
  findSubscription,
  createOrReactivateSubscription,
  cancelSubscription,
  listSubscriptionsForUser,
  listSubscribersForAuthor,
  countActiveSubscribers,
};