require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

// DATABASE_URL (Neon/production) ya individual DB_* vars (local dev) — dono mein se ek zaroori hai
const hasConnectionString = !!process.env.DATABASE_URL;
const hasIndividualDbVars = !!(
  process.env.DB_USER &&
  process.env.DB_PASSWORD &&
  process.env.DB_HOST &&
  process.env.DB_PORT &&
  process.env.DB_NAME
);

if (!hasConnectionString && !hasIndividualDbVars) {
  throw new Error(
    'Missing DB config: either set DATABASE_URL, or set DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME'
  );
}

const required = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  db: {
    // Neon/production: connectionString use hogi. Local dev: individual vars se banegi (db.js mein).
    connectionString: process.env.DATABASE_URL || null,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cookie: {
    refreshTokenName: process.env.COOKIE_NAME || 'substack_refresh_token',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};