// routes/authRoutes.js
const express = require('express');
const { login, refreshToken, logout } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh  — silently gets a new access token using httpOnly cookie
router.post('/refresh', refreshToken);

// POST /api/auth/logout — revokes refresh token
router.post('/logout', logout);

module.exports = router;
