// config/db.js
// Mock in-memory database (replace with MongoDB/PostgreSQL in production)
const bcrypt = require('bcryptjs');

// In-memory store for users and refresh tokens
const db = {
  users: [],
  refreshTokens: [], // whitelist of valid refresh tokens
};

/**
 * Seed initial users into the mock database
 */
async function seedDatabase() {
  const users = [
    {
      id: '1',
      email: 'admin@aigenius.com',
      password: await bcrypt.hash('Admin@123', 12),
      role: 'Admin',
    },
    {
      id: '2',
      email: 'premium@aigenius.com',
      password: await bcrypt.hash('Premium@123', 12),
      role: 'Premium_User',
    },
    {
      id: '3',
      email: 'free@aigenius.com',
      password: await bcrypt.hash('Free@123', 12),
      role: 'Free_User',
    },
  ];

  db.users = users;
  console.log('✅ Mock database seeded with 3 users.');
}

module.exports = { db, seedDatabase };
