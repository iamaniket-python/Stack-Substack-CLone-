const { query } = require('../config/db');

const recordView = async (storyId, viewerId) => {
  await query(
    `INSERT INTO story_views (story_id, viewer_id) VALUES ($1, $2)
     ON CONFLICT (story_id, viewer_id) DO NOTHING`,
    [storyId, viewerId]
  );
};

const countViews = async (storyId) => {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM story_views WHERE story_id = $1', [storyId]);
  return rows[0].count;
};

module.exports = { recordView, countViews };