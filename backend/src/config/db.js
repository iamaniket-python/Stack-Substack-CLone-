const { Pool } = require('pg');
const env = require('./env');

// Neon (production) → connectionString + SSL. Local dev → individual DB_* vars, no SSL.
const poolConfig = env.db.connectionString
  ? {
      connectionString: env.db.connectionString,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: env.db.user,
      password: env.db.password,
      host: env.db.host,
      port: env.db.port,
      database: env.db.name,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
 
  console.error('Unexpected error on idle PG client:', err.message);
});

// Every query goes through here so we can log/instrument centrally
const query = (text, params) => pool.query(text, params);

// For transactions — controllers that need multi-step writes call this
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = { pool, query, getClient };