const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');

const server = app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing server gracefully...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});