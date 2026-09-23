const { query } = require('../config/db');

const createPost = async ({ authorId, title, slug, excerpt, content, coverImageUrl, isPaid, status }) => {
  const { rows } = await query(
    `INSERT INTO posts (author_id, title, slug, excerpt, content, cover_image_url, is_paid, status, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      authorId, title, slug, excerpt, content, coverImageUrl, isPaid, status,
      status === 'published' ? new Date() : null,
    ]
  );
  return rows[0];
};

const findPostBySlug = async (slug) => {
  const { rows } = await query(
    `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.slug = $1`,
    [slug]
  );
  return rows[0];
};

const findPostById = async (id) => {
  const { rows } = await query('SELECT * FROM posts WHERE id = $1', [id]);
  return rows[0];
};

// Feed: published posts, newest first, paginated
const listPublishedPosts = async ({ limit, offset }) => {
  const { rows } = await query(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.is_paid, p.published_at,
            u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.status = 'published'
     ORDER BY p.published_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
};

const listPostsByAuthor = async (authorId, { includeDrafts }) => {
  const statusFilter = includeDrafts ? '' : `AND status = 'published'`;
  const { rows } = await query(
    `SELECT * FROM posts WHERE author_id = $1 ${statusFilter} ORDER BY created_at DESC`,
    [authorId]
  );
  return rows;
};

const updatePost = async (id, fields) => {
  const keys = Object.keys(fields);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = keys.map((key) => fields[key]);

  const { rows } = await query(
    `UPDATE posts SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0];
};

const deletePost = async (id) => {
  await query('DELETE FROM posts WHERE id = $1', [id]);
};

const listPublishedByAuthorPaginated = async (authorId, { limit, offset }) => {
  const { rows } = await query(
    `SELECT id, title, slug, excerpt, cover_image_url, is_paid, published_at
     FROM posts
     WHERE author_id = $1 AND status = 'published'
     ORDER BY published_at DESC
     LIMIT $2 OFFSET $3`,
    [authorId, limit, offset]
  );
  return rows;
};

const countPublishedByAuthor = async (authorId) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM posts WHERE author_id = $1 AND status = 'published'`,
    [authorId]
  );
  return rows[0].count;
};

const searchPosts = async ({ queryText, limit, offset }) => {
  const { rows } = await query(
    `SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image_url, p.is_paid, p.published_at,
            u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar,
            ts_rank(p.search_vector, websearch_to_tsquery('english', $1)) AS rank
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.status = 'published'
       AND p.search_vector @@ websearch_to_tsquery('english', $1)
     ORDER BY rank DESC, p.published_at DESC
     LIMIT $2 OFFSET $3`,
    [queryText, limit, offset]
  );
  return rows;
};

const countSearchResults = async (queryText) => {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count FROM posts
     WHERE status = 'published' AND search_vector @@ websearch_to_tsquery('english', $1)`,
    [queryText]
  );
  return rows[0].count;
};

module.exports = {
  createPost,
  findPostBySlug,
  findPostById,
  listPublishedPosts,
  listPostsByAuthor,
  updatePost,
  deletePost,
  listPublishedByAuthorPaginated,
  countPublishedByAuthor,
  searchPosts,
  countSearchResults
};