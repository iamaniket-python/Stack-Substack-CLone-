const { query } = require('../config/db');

const saveRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );
};

const findValidToken = async (tokenHash) => {
  const { rows } = await query(
    `SELECT * FROM refresh_tokens
     WHERE token_hash = $1 AND revoked = FALSE AND expires_at > NOW()`,
    [tokenHash]
  );
  return rows[0];
};

const revokeToken = async (tokenHash) => {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1', [tokenHash]);
};

const revokeAllUserTokens = async (userId) => {
  await query('UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1', [userId]);
};

module.exports = { saveRefreshToken, findValidToken, revokeToken, revokeAllUserTokens };