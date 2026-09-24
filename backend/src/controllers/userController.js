const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPublicProfile } = require('../models/userModel');
const { query } = require('../config/db');
const {
  listPublishedByAuthorPaginated,
  countPublishedByAuthor,
} = require('../models/postModel');
const { countActiveSubscribers } = require('../models/subscriptionModel');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await getPublicProfile(req.params.id);
  if (!profile) throw new ApiError(404, 'Author not found');

  const subscriberCount = await countActiveSubscribers(req.params.id);
  const postCount = await countPublishedByAuthor(req.params.id);

  res.json({ success: true, data: { profile, subscriberCount, postCount } });
});

const getProfilePosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const posts = await listPublishedByAuthorPaginated(req.params.id, { limit, offset });
  res.json({ success: true, data: { posts, page, limit } });
});

const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ success: true, data: { users: [] } });

  const { rows } = await query(
    `SELECT id, name, avatar_url, bio FROM users
     WHERE name ILIKE $1 AND id != $2
     ORDER BY name ASC
     LIMIT 10`,
    [`%${q}%`, req.userId]
  );

  res.json({ success: true, data: { users: rows } });
});

module.exports = { getProfile, getProfilePosts, searchUsers };