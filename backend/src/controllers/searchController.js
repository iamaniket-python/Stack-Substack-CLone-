const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { searchPosts, countSearchResults } = require('../models/postModel');

const search = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) throw new ApiError(400, 'Search query is required');

  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    searchPosts({ queryText: q, limit, offset }),
    countSearchResults(q),
  ]);

  res.json({ success: true, data: { posts, total, page, limit } });
});

module.exports = { search };