// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

// ─────────────────────────────────────────────
// Token Generators
// ─────────────────────────────────────────────

/**
 * Generate a short-lived Access Token (15 minutes)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  });
};

/**
 * Generate a long-lived Refresh Token (7 days)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
};

/**
 * Cookie options for the httpOnly refresh token cookie
 */
const refreshCookieOptions = {
  httpOnly: true,                  // JS cannot access this cookie
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict',              // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return next(new AppError('Please provide both email and password.', 400));
    }

    // 2. Find user in mock DB
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 3. Verify password using bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(new AppError('Invalid email or password.', 401));
    }

    // 4. Build JWT payload (NO sensitive data)
    const payload = { id: user.id, email: user.email, role: user.role };

    // 5. Generate tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // 6. Whitelist the refresh token in DB
    db.refreshTokens.push(refreshToken);

    // 7. Send refresh token in secure httpOnly cookie
    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    // 8. Send access token in response body
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// ─────────────────────────────────────────────
const refreshToken = (req, res, next) => {
  try {
    // 1. Read refresh token from secure cookie
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(
        new AppError('No refresh token found. Please log in again.', 401)
      );
    }

    // 2. Check if token is in the whitelist
    if (!db.refreshTokens.includes(token)) {
      return next(
        new AppError(
          'Refresh token has been revoked. Please log in again.',
          401
        )
      );
    }

    // 3. Verify the refresh token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 4. Issue a new Access Token
    const payload = { id: decoded.id, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);

    res.status(200).json({
      status: 'success',
      message: 'Access token refreshed successfully.',
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────
const logout = (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      // Remove from whitelist
      const index = db.refreshTokens.indexOf(token);
      if (index > -1) db.refreshTokens.splice(index, 1);
    }

    // Clear the cookie
    res.clearCookie('refreshToken', refreshCookieOptions);

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, logout };
