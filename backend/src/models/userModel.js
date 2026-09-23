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

module.exports = { createUser, findUserByEmail, findUserById ,getPublicProfile ,updateUserAvatar };