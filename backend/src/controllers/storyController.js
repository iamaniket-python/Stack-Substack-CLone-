const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const {
  createStory,
  listActiveStoriesFromAuthors,
  findStoryById,
  deleteStory,
} = require('../models/storyModel');
const { recordView, countViews } = require('../models/storyViewModel');
const { getSubscribedAuthorIds } = require('../models/subscriptionModel');

const create = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No media uploaded');

  const result = await uploadToCloudinary(req.file.buffer, 'substack-clone/stories');

  const story = await createStory({
    authorId: req.userId,
    mediaUrl: result.secure_url,
    mediaPublicId: result.public_id,
    caption: req.body.caption,
  });

  res.status(201).json({ success: true, data: { story } });
});

// Feed grouped by author, like Instagram/WhatsApp story rows — stories from
// people the viewer subscribes to, plus their own
const feed = asyncHandler(async (req, res) => {
  const authorIds = await getSubscribedAuthorIds(req.userId);
  authorIds.push(req.userId);

  const stories = await listActiveStoriesFromAuthors(authorIds);

  const grouped = stories.reduce((acc, story) => {
    if (!acc[story.author_id]) {
      acc[story.author_id] = {
        authorId: story.author_id,
        authorName: story.author_name,
        authorAvatar: story.author_avatar,
        stories: [],
      };
    }
    acc[story.author_id].stories.push(story);
    return acc;
  }, {});

  res.json({ success: true, data: { authors: Object.values(grouped) } });
});

const view = asyncHandler(async (req, res) => {
  const story = await findStoryById(req.params.id);
  if (!story) throw new ApiError(404, 'Story not found or expired');

  if (story.author_id !== req.userId) {
    await recordView(story.id, req.userId);
  }

  // Only the author gets to see the view count — same privacy model as Instagram stories
  const viewCount = story.author_id === req.userId ? await countViews(story.id) : null;

  res.json({ success: true, data: { story, viewCount } });
});

const remove = asyncHandler(async (req, res) => {
  const story = await findStoryById(req.params.id);
  if (!story) throw new ApiError(404, 'Story not found');
  if (story.author_id !== req.userId) throw new ApiError(403, 'Not your story');

  await cloudinary.uploader.destroy(story.media_public_id, { resource_type: 'image' });
  await deleteStory(story.id);

  res.json({ success: true, message: 'Story deleted' });
});

module.exports = { create, feed, view, remove };