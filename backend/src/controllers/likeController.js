const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findPostById } = require('../models/postModel');
const { findLike, addLike, removeLike, countLikesForPost } = require('../models/likeModel');

// Single endpoint that flips the state — simpler for the frontend than
// separate like/unlike routes, and avoids a race where the client's local
// state disagrees with the server on which action to call.
const toggle = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await findPostById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const existing = await findLike(postId, req.userId);

  if (existing) {
    await removeLike(postId, req.userId);
  } else {
    await addLike(postId, req.userId);
  }

  const count = await countLikesForPost(postId);
  res.json({ success: true, data: { liked: !existing, count } });
});

const status = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const existing = req.userId ? await findLike(postId, req.userId) : null;
  const count = await countLikesForPost(postId);
  res.json({ success: true, data: { liked: !!existing, count } });
});

module.exports = { toggle, status };