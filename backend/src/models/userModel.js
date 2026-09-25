const { query } = require('../config/db');

const createUser = async ({ name, email, passwordHash }) => {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, bio, avatar_url, is_verified, created_at`,
    [name, email, passwordHash]
  );
  return rows[0];
};

const findUserByEmail = async (email) => {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await query(
    'SELECT id, name, email, bio, avatar_url, is_verified, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0];
};

const getPublicProfile = async (userId) => {
  const { rows } = await query(
    `SELECT id, name, bio, avatar_url, created_at FROM users WHERE id = $1`,
    [userId]
  );
  return rows[0];
};

const updateUserAvatar = async (userId, avatarUrl) => {
  const { rows } = await query(
    `UPDATE users SET avatar_url = $2, updated_at = NOW() WHERE id = $1
     RETURNING id, name, email, bio, avatar_url, is_verified, created_at`,
    [userId, avatarUrl]
  );
  return rows[0];
};

const isUsernameTaken = async (username, excludeUserId) => {
  const { rows } = await query(
    `SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2`,
    [username, excludeUserId]
  );
  return rows.length > 0;
};

const updateProfile = async (userId, { name, username, bio, avatar_url }) => {
  // Built dynamically so we only touch columns that were actually provided —
  // e.g. avatar_url stays untouched if the user didn't upload a new image.
  const fields = [];
  const values = [];
  let i = 1;

  if (name !== undefined) { fields.push(`name = $${i++}`); values.push(name); }
  if (username !== undefined) { fields.push(`username = $${i++}`); values.push(username); }
  if (bio !== undefined) { fields.push(`bio = $${i++}`); values.push(bio); }
  if (avatar_url !== undefined) { fields.push(`avatar_url = $${i++}`); values.push(avatar_url); }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const { rows } = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} 
     RETURNING id, name, username, email, bio, avatar_url`,
    values
  );
  return rows[0];
};


module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  getPublicProfile,
  updateUserAvatar,
  isUsernameTaken,
  updateProfile,
};