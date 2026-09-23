const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
  user: env.db.user,
  password: env.db.password,
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PG client', err);
  process.exit(1);
});

// Every query goes through here so we can log/instrument centrally
const query = (text, params) => pool.query(text, params);

// For transactions — controllers that need multi-step writes call this
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = { pool, query, getClient };