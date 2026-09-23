const { query } = require('../config/db');

const findLike = async (postId, userId) => {
  const { rows } = await query(
    'SELECT * FROM likes WHERE post_id = $1 AND user_id = $2',
    [postId, userId]
  );
  return rows[0];
};

const addLike = async (postId, userId) => {
  const { rows } = await query(
    `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
     ON CONFLICT (post_id, user_id) DO NOTHING
     RETURNING *`,
    [postId, userId]
  );
  return rows[0];
};

const removeLike = async (postId, userId) => {
  await query('DELETE FROM likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
};

const countLikesForPost = async (postId) => {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS count FROM likes WHERE post_id = $1',
    [postId]
  );
  return rows[0].count;
};

module.exports = { findLike, addLike, removeLike, countLikesForPost };