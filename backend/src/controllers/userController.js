const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getPublicProfile } = require('../models/userModel');
const { query } = require('../config/db');
const { updateProfile, isUsernameTaken } = require('../models/userModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadToCloudinary');[]

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

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, username, bio } = req.body;
  const updates = {};

  if (name !== undefined) {
    if (!name.trim()) throw new ApiError(400, 'Name cannot be empty');
    updates.name = name.trim().slice(0, 100);
  }

  if (username !== undefined) {
    const normalized = username.trim().toLowerCase();
    if (!USERNAME_REGEX.test(normalized)) {
      throw new ApiError(400, 'Username must be 3-30 characters: lowercase letters, numbers, underscore only');
    }
    const taken = await isUsernameTaken(normalized, req.userId);
    if (taken) throw new ApiError(409, 'Username is already taken');
    updates.username = normalized;
  }

  if (bio !== undefined) {
    updates.bio = bio.slice(0, 280); // keep in sync with frontend maxLength
  }

  if (req.file) {
    // Fetch current avatar so we can delete it AFTER the new upload succeeds —
    // never delete-then-upload, or a failed upload leaves the user with no avatar at all.
    const { rows } = await query('SELECT avatar_url FROM users WHERE id = $1', [req.userId]);
    const oldAvatarUrl = rows[0]?.avatar_url;

    const result = await uploadToCloudinary(req.file.buffer, 'substack-clone/avatars');
    updates.avatar_url = result.secure_url;

    if (oldAvatarUrl) {
      deleteFromCloudinary(oldAvatarUrl); // fire-and-forget, doesn't block the response
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, 'No fields to update');
  }

  const updatedUser = await updateProfile(req.userId, updates);
  res.json({ success: true, data: { user: updatedUser } });
});

module.exports = { getProfile, getProfilePosts, searchUsers, updateMyProfile };