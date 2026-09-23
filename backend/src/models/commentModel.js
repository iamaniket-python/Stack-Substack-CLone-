const { query } = require('../config/db');

const createComment = async ({ postId, userId, parentCommentId, content }) => {
  const { rows } = await query(
    `INSERT INTO comments (post_id, user_id, parent_comment_id, content)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [postId, userId, parentCommentId || null, content]
  );
  return rows[0];
};

// Fetch all comments for a post in one query, flat — we build the tree in JS
const listCommentsForPost = async (postId) => {
  const { rows } = await query(
    `SELECT c.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = $1
     ORDER BY c.created_at ASC`,
    [postId]
  );
  return rows;
};

const findCommentById = async (id) => {
  const { rows } = await query('SELECT * FROM comments WHERE id = $1', [id]);
  return rows[0];
};

const deleteComment = async (id) => {
  await query('DELETE FROM comments WHERE id = $1', [id]);
};

module.exports = { createComment, listCommentsForPost, findCommentById, deleteComment };