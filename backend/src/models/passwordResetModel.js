const { query } = require('../config/db');

// Naya token banane se pehle user ke purane unused tokens hata do:
// hamesha sirf ek valid reset link rahega.
const createResetToken = async ({ userId, tokenHash, expiresAt }) => {
  await query('DELETE FROM password_resets WHERE user_id = $1 AND used_at IS NULL', [userId]);
  await query(
    `INSERT INTO password_resets (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

// Atomic: check + mark used ek hi query mein, taaki same token do baar use na ho sake.
// Valid ho to user_id milta hai, warna undefined.
const consumeResetToken = async (tokenHash) => {
  const { rows } = await query(
    `UPDATE password_resets
     SET used_at = NOW()
     WHERE token_hash = $1 AND used_at IS NULL AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash]
  );
  return rows[0]?.user_id;
};

const updateUserPassword = async (userId, passwordHash) => {
  await query(
    'UPDATE users SET password_hash = $2, updated_at = NOW() WHERE id = $1',
    [userId, passwordHash]
  );
};

module.exports = { createResetToken, consumeResetToken, updateUserPassword };