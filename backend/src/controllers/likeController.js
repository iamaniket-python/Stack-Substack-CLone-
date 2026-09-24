const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { findPostById } = require('../models/postModel');
const { findLike, addLike, removeLike, countLikesForPost } = require('../models/likeModel');
const { notify } = require('../services/notificationService');


const toggle = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await findPostById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  const existing = await findLike(postId, req.userId);

  if (existing) {
    await removeLike(postId, req.userId);
  } else {
    await addLike(postId, req.userId);

    if (post.author_id !== req.userId) {
      await notify({
        recipientId: post.author_id,
        actorId: req.userId,
        type: 'new_like',
        entityId: postId,
        message: 'liked your post',
      });
    }
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