// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

/**
 * PROTECT MIDDLEWARE
 * Reads the Bearer token from Authorization header,
 * verifies it, and attaches the decoded payload to req.user
 */
const protect = (req, res, next) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError(
          'No token provided. Please log in to get access.',
          401
        )
      );
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify the token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user payload to request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    // Pass JWT errors to centralized error handler
    next(err);
  }
};

/**
 * RESTRICT TO MIDDLEWARE FACTORY
 * Returns a middleware that only allows users with specified roles.
 * Usage: restrictTo('Admin', 'Premium_User')
 *
 * @param {...string} roles - Allowed role names
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError('You must be logged in to access this resource.', 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. This route is restricted to: ${roles.join(', ')}.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = { protect, restrictTo };
