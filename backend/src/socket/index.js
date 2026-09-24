const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/tokenUtils');
const env = require('../config/env');
const { sendMessageSocketHandler } = require('./handlers/messageHandler');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId);

    socket.on('conversation:join', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('message:send', (payload, callback) => {
      sendMessageSocketHandler(io, socket, payload, callback);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typing', { conversationId, userId: socket.userId, isTyping });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };