// routes/aiRoutes.js
const express = require('express');
const { freeModel, premiumModel, purgeCache } = require('../controllers/aiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// All AI routes require authentication first
router.use(protect);

// GET  /api/ai/free-model  — accessible by ALL logged-in users
router.get('/free-model', freeModel);

// POST /api/ai/premium-model — accessible by Premium_User and Admin only
router.post(
  '/premium-model',
  restrictTo('Premium_User', 'Admin'),
  premiumModel
);

// DELETE /api/ai/purge-cache — accessible by Admin only
router.delete(
  '/purge-cache',
  restrictTo('Admin'),
  purgeCache
);

module.exports = router;
