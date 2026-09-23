const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { generateUniqueSlug } = require('../utils/slugify');
const {
  createPost,
  findPostBySlug,
  listPublishedPosts,
  listPostsByAuthor,
  updatePost,
  deletePost,
  findPostById,
} = require('../models/postModel');
const { hasActivePaidSubscription } = require('../models/subscriptionModel');

const create = asyncHandler(async (req, res) => {
  const { title, excerpt, content, coverImageUrl, isPaid, status } = req.body;

  const slug = await generateUniqueSlug(title);
  const post = await createPost({
    authorId: req.userId,
    title,
    slug,
    excerpt,
    content,
    coverImageUrl,
    isPaid: !!isPaid,
    status: status === 'published' ? 'published' : 'draft',
  });

  res.status(201).json({ success: true, data: { post } });
});

const feed = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const posts = await listPublishedPosts({ limit, offset });
  res.json({ success: true, data: { posts, page, limit } });
});

// Applies the paywall: strips `content` if post is paid and reader isn't entitled
const getBySlug = asyncHandler(async (req, res) => {
  const post = await findPostBySlug(req.params.slug);
  if (!post || post.status !== 'published') {
    throw new ApiError(404, 'Post not found');
  }

  let locked = false;

  if (post.is_paid) {
    const isAuthor = req.userId === post.author_id;
    const isSubscriber = req.userId
      ? await hasActivePaidSubscription(req.userId, post.author_id)
      : false;

    if (!isAuthor && !isSubscriber) {
      locked = true;
      post.content = null; // strip content, keep excerpt/metadata for the paywall UI
    }
  }

  res.json({ success: true, data: { post, locked } });
});

const myPosts = asyncHandler(async (req, res) => {
  const posts = await listPostsByAuthor(req.userId, { includeDrafts: true });
  res.json({ success: true, data: { posts } });
});

const update = asyncHandler(async (req, res) => {
  const existing = await findPostById(req.params.id);
  if (!existing) throw new ApiError(404, 'Post not found');
  if (existing.author_id !== req.userId) throw new ApiError(403, 'Not your post');

  const allowedFields = ['title', 'excerpt', 'content', 'cover_image_url', 'is_paid', 'status'];
  const updates = {};

  for (const field of allowedFields) {
    const camelKey = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    if (req.body[camelKey] !== undefined) updates[field] = req.body[camelKey];
  }

  if (updates.status === 'published' && existing.status !== 'published') {
    updates.published_at = new Date();
  }

  const post = await updatePost(req.params.id, updates);
  res.json({ success: true, data: { post } });
});

const remove = asyncHandler(async (req, res) => {
  const existing = await findPostById(req.params.id);
  if (!existing) throw new ApiError(404, 'Post not found');
  if (existing.author_id !== req.userId) throw new ApiError(403, 'Not your post');

  await deletePost(req.params.id);
  res.json({ success: true, message: 'Post deleted' });
});

module.exports = { create, feed, getBySlug, myPosts, update, remove };