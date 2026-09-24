const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(
  express.json({
    limit: '10kb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Routes api
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));


app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is healthy' });
});

// Routes will be mounted here as we build them
// app.use('/api/auth', require('./routes/authRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;