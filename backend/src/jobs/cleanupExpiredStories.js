const cron = require('node-cron');
const cloudinary = require('../config/cloudinary');
const { findExpiredStories, deleteStory } = require('../models/storyModel');
const logger = require('../utils/logger');

const cleanupExpiredStories = async () => {
  const expired = await findExpiredStories();

  for (const story of expired) {
    try {
      await cloudinary.uploader.destroy(story.media_public_id, { resource_type: 'image' });
      await deleteStory(story.id);
    } catch (err) {
      logger.error(`Failed to clean up expired story ${story.id}`, err);
    }
  }

  if (expired.length > 0) {
    logger.info(`Cleaned up ${expired.length} expired stories`);
  }
};

const startStoryCleanupJob = () => {
  cron.schedule('0 * * * *', cleanupExpiredStories); // every hour, on the hour
};

module.exports = { startStoryCleanupJob, cleanupExpiredStories };