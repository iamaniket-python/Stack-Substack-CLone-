const pool = require("../config/db"); // apne pg pool ka actual path daal do
const asyncHandler = require("../utils/asyncHandler");

/* ---------------------------------------------------------
   GET /api/profile/posts
   Apni saari posts (draft + published)
--------------------------------------------------------- */
const getMyPosts = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { rows } = await pool.query(
    `SELECT id, title, slug, excerpt, cover_image_url, status, is_paid,
            published_at, created_at
     FROM posts
     WHERE author_id = $1
     ORDER BY COALESCE(published_at, created_at) DESC`,
    [userId]
  );

  res.status(200).json({ success: true, data: { posts: rows } });
});

/* ---------------------------------------------------------
   GET /api/profile/replies
   Apne comments, post title/slug ke saath
--------------------------------------------------------- */
const getMyReplies = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { rows } = await pool.query(
    `SELECT c.id, c.content, c.created_at, c.parent_comment_id,
            p.id AS post_id, p.slug AS post_slug, p.title AS post_title
     FROM comments c
     JOIN posts p ON p.id = c.post_id
     WHERE c.user_id = $1
     ORDER BY c.created_at DESC`,
    [userId]
  );

  res.status(200).json({ success: true, data: { replies: rows } });
});

/* ---------------------------------------------------------
   GET /api/profile/likes
   Jo posts like ki hain — PostCard component ke liye ready shape
--------------------------------------------------------- */
const getMyLikes = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { rows } = await pool.query(
    `SELECT
        p.id, p.slug, p.excerpt, p.content, p.cover_image_url,
        p.is_paid, p.published_at,
        u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar,
        (SELECT COUNT(*)::int FROM likes l2 WHERE l2.post_id = p.id) AS like_count,
        (SELECT COUNT(*)::int FROM comments c2 WHERE c2.post_id = p.id) AS comment_count,
        TRUE AS is_liked,
        EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.subscriber_id = $1 AND s.author_id = p.author_id AND s.status = 'active'
        ) AS is_subscribed
     FROM likes l
     JOIN posts p ON p.id = l.post_id
     JOIN users u ON u.id = p.author_id
     WHERE l.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );

  res.status(200).json({ success: true, data: { posts: rows } });
});

/* ---------------------------------------------------------
   GET /api/profile/subscriptions
   Jin authors ko subscribe kiya hai
--------------------------------------------------------- */
const getMySubscriptions = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { rows } = await pool.query(
    `SELECT
        s.id AS subscription_id, s.tier, s.status, s.current_period_end, s.created_at,
        u.id AS author_id, u.name AS author_name, u.avatar_url AS author_avatar,
        u.username AS author_username,
        (SELECT COUNT(*)::int FROM posts p WHERE p.author_id = u.id AND p.status = 'published') AS post_count
     FROM subscriptions s
     JOIN users u ON u.id = s.author_id
     WHERE s.subscriber_id = $1
     ORDER BY s.created_at DESC`,
    [userId]
  );

  res.status(200).json({ success: true, data: { subscriptions: rows } });
});

/* ---------------------------------------------------------
   GET /api/profile/activity
   Combined timeline: posts publish kiye + comments kiye + likes diye,
   sab time ke hisaab se sorted, ek hi feed mein
--------------------------------------------------------- */
const getMyActivity = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const { rows } = await pool.query(
    `
    (
      SELECT 'post' AS activity_type, p.id AS activity_id, p.created_at AS occurred_at,
             p.id AS post_id, p.slug AS post_slug, p.title AS post_title,
             p.excerpt AS snippet
      FROM posts p
      WHERE p.author_id = $1 AND p.status = 'published'
    )
    UNION ALL
    (
      SELECT 'comment' AS activity_type, c.id AS activity_id, c.created_at AS occurred_at,
             p.id AS post_id, p.slug AS post_slug, p.title AS post_title,
             LEFT(c.content, 140) AS snippet
      FROM comments c
      JOIN posts p ON p.id = c.post_id
      WHERE c.user_id = $1
    )
    UNION ALL
    (
      SELECT 'like' AS activity_type, l.id AS activity_id, l.created_at AS occurred_at,
             p.id AS post_id, p.slug AS post_slug, p.title AS post_title,
             NULL AS snippet
      FROM likes l
      JOIN posts p ON p.id = l.post_id
      WHERE l.user_id = $1
    )
    ORDER BY occurred_at DESC
    `,
    [userId]
  );

  res.status(200).json({ success: true, data: { activity: rows } });
});

module.exports = {
  getMyPosts,
  getMyReplies,
  getMyLikes,
  getMySubscriptions,
  getMyActivity,
};
