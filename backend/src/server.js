const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { pool } = require('./config/db');
const { initSocket } = require('./socket');
const logger = require('./utils/logger');
const { startStoryCleanupJob } = require('./jobs/cleanupExpiredStories');

const httpServer = http.createServer(app);
initSocket(httpServer);

const server = httpServer.listen(env.port, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  startStoryCleanupJob();
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing server gracefully...');
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
});