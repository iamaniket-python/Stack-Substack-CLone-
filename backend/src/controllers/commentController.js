const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const buildCommentTree = require('../utils/buildCommentTree');
const {
  createComment,
  listCommentsForPost,
  findCommentById,
  deleteComment,
} = require('../models/commentModel');
const { findPostById } = require('../models/postModel');

const create = asyncHandler(async (req, res) => {
  const { postId, content, parentCommentId } = req.body;

  const post = await findPostById(postId);
  if (!post) throw new ApiError(404, 'Post not found');

  if (parentCommentId) {
    const parent = await findCommentById(parentCommentId);
    if (!parent || parent.post_id !== postId) {
      throw new ApiError(400, 'Invalid parent comment');
    }
  }

  const comment = await createComment({
    postId,
    userId: req.userId,
    parentCommentId,
    content,
  });

  res.status(201).json({ success: true, data: { comment } });
});

const listForPost = asyncHandler(async (req, res) => {
  const flat = await listCommentsForPost(req.params.postId);
  const tree = buildCommentTree(flat);
  res.json({ success: true, data: { comments: tree, count: flat.length } });
});

const remove = asyncHandler(async (req, res) => {
  const comment = await findCommentById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const post = await findPostById(comment.post_id);
  const isCommentOwner = comment.user_id === req.userId;
  const isPostAuthor = post && post.author_id === req.userId;

  // Either the commenter or the post's author can remove a comment (moderation)
  if (!isCommentOwner && !isPostAuthor) {
    throw new ApiError(403, 'Not authorized to delete this comment');
  }

  await deleteComment(req.params.id);
  res.json({ success: true, message: 'Comment deleted' });
});

module.exports = { create, listForPost, remove };