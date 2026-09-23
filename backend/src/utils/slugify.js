const { query } = require('../config/db');

const baseSlugify = (title) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

// Appends -1, -2... if the slug already exists, so titles can repeat
const generateUniqueSlug = async (title) => {
  const base = baseSlugify(title);
  let slug = base;
  let counter = 1;

  while (true) {
    const { rows } = await query('SELECT id FROM posts WHERE slug = $1', [slug]);
    if (rows.length === 0) break;
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

module.exports = { generateUniqueSlug };