const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const multer = require('multer');

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
   if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5MB)' : err.message,
    });
  }
  let { statusCode, message } = err;

  if (!statusCode) statusCode = 500;
  if (!err.isOperational) {
    console.error('UNEXPECTED ERROR:', err);
    message = env.nodeEnv === 'production' ? 'Something went wrong' : message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
};



module.exports = { notFound, errorHandler ,errorHandler };