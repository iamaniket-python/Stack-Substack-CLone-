const { verifyAccessToken } = require('../utils/tokenUtils');
const asyncHandler = require('../utils/asyncHandler');

const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = verifyAccessToken(authHeader.split(' ')[1]);
      req.userId = decoded.sub;
    } catch {
      // invalid/expired token on an optional route — just treat as logged out
    }
  }
  next();
});

module.exports = optionalAuth;