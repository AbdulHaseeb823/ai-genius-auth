// controllers/aiController.js

// ─────────────────────────────────────────────
// GET /api/ai/free-model
// Accessible by ALL logged-in users
// ─────────────────────────────────────────────
const freeModel = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Welcome, ${req.user.email}! You are using the Free AI Model.`,
    model: 'ai-genius-free-v1',
    result: 'Generated text: The quick brown fox jumps over the lazy dog.',
    accessLevel: req.user.role,
  });
};

// ─────────────────────────────────────────────
// POST /api/ai/premium-model
// Accessible by Premium_User and Admin ONLY
// ─────────────────────────────────────────────
const premiumModel = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Welcome, ${req.user.email}! You are using the Premium AI Model.`,
    model: 'ai-genius-premium-v3',
    result: {
      text: 'High-quality generated content: A sophisticated AI response...',
      image_url: 'https://ai-genius.com/generated/img_9283jd.png',
      tokens_used: 512,
    },
    accessLevel: req.user.role,
  });
};

// ─────────────────────────────────────────────
// DELETE /api/ai/purge-cache
// Accessible by Admin ONLY
// ─────────────────────────────────────────────
const purgeCache = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: `Admin ${req.user.email} has successfully purged the AI model cache.`,
    action: 'CACHE_PURGED',
    timestamp: new Date().toISOString(),
    affectedModels: ['ai-genius-free-v1', 'ai-genius-premium-v3'],
  });
};

module.exports = { freeModel, premiumModel, purgeCache };
