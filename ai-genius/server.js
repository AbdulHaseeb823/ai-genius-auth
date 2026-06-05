// server.js
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const { seedDatabase } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// ─────────────────────────────────────────────
// Global Middlewares
// ─────────────────────────────────────────────
app.use(express.json());           // Parse JSON request bodies
app.use(cookieParser());           // Parse cookies (needed for httpOnly refresh token)

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    platform: 'AI-Genius SaaS',
    version: '1.0.0',
    message: 'Authentication & Authorization subsystem is active.',
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Route ${req.method} ${req.originalUrl} not found on this server.`,
  });
});

// ─────────────────────────────────────────────
// Centralized Error Handler (must be last)
// ─────────────────────────────────────────────
app.use(globalErrorHandler);

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await seedDatabase(); // Seed mock users on startup
  app.listen(PORT, () => {
    console.log(`\n🚀 AI-Genius server running on http://localhost:${PORT}`);
    console.log('─────────────────────────────────────────');
    console.log('📋 Test Accounts:');
    console.log('   Admin:         admin@aigenius.com    / Admin@123');
    console.log('   Premium User:  premium@aigenius.com  / Premium@123');
    console.log('   Free User:     free@aigenius.com     / Free@123');
    console.log('─────────────────────────────────────────');
    console.log('🔐 Auth Endpoints:');
    console.log(`   POST   /api/auth/login`);
    console.log(`   POST   /api/auth/refresh`);
    console.log(`   POST   /api/auth/logout`);
    console.log('🤖 AI Endpoints:');
    console.log(`   GET    /api/ai/free-model      (all roles)`);
    console.log(`   POST   /api/ai/premium-model   (Premium_User, Admin)`);
    console.log(`   DELETE /api/ai/purge-cache     (Admin only)`);
    console.log('─────────────────────────────────────────\n');
  });
};

startServer();
