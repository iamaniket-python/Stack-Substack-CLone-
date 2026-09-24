const { query } = require('../config/db');

const createStory = async ({ authorId, mediaUrl, mediaPublicId, caption }) => {
  const { rows } = await query(
    `INSERT INTO stories (author_id, media_url, media_public_id, caption)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [authorId, mediaUrl, mediaPublicId, caption || null]
  );
  return rows[0];
};

// Stories from a given set of authors (the viewer's subscriptions + themself), still active
const listActiveStoriesFromAuthors = async (authorIds) => {
  if (authorIds.length === 0) return [];
  const { rows } = await query(
    `SELECT s.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM stories s
     JOIN users u ON u.id = s.author_id
     WHERE s.author_id = ANY($1::uuid[]) AND s.expires_at > NOW()
     ORDER BY s.author_id, s.created_at ASC`,
    [authorIds]
  );
  return rows;
};

const findStoryById = async (id) => {
  const { rows } = await query('SELECT * FROM stories WHERE id = $1 AND expires_at > NOW()', [id]);
  return rows[0];
};

const deleteStory = async (id) => {
  await query('DELETE FROM stories WHERE id = $1', [id]);
};

// Used only by the cleanup job — deliberately ignores the expires_at > NOW() filter
const findExpiredStories = async () => {
  const { rows } = await query('SELECT * FROM stories WHERE expires_at <= NOW()');
  return rows;
};

module.exports = {
  createStory,
  listActiveStoriesFromAuthors,
  findStoryById,
  deleteStory,
  findExpiredStories,
};