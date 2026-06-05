# AI-Genius — JWT Auth & RBAC Subsystem

> **MA 216 – Web Engineering and AI** | Air University, Islamabad  
> Secure, stateless authentication and authorization using Node.js, Express, and JWT.

---

## 📁 Project Structure

```
ai-genius/
├── config/
│   └── db.js                  # Mock in-memory database + seed users
├── controllers/
│   ├── authController.js      # Login, Refresh, Logout logic
│   └── aiController.js        # Mock AI endpoint handlers
├── middleware/
│   ├── authMiddleware.js      # protect() and restrictTo() middleware
│   └── errorHandler.js        # AppError class + global error handler
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   └── aiRoutes.js            # /api/ai/*
├── .env                       # Environment secrets (DO NOT COMMIT)
├── .env.example               # Template for required env variables
├── server.js                  # Express app entry point
├── package.json
└── AI-Genius.postman_collection.json
```

---

## ⚙️ Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Copy env file (already done; edit if needed)
cp .env.example .env

# 3. Start the server
npm start
# or for hot-reload:
npm run dev
```

Server starts at: `http://localhost:5000`

---

## 👥 Test Accounts (auto-seeded on startup)

| Role         | Email                    | Password     |
|--------------|--------------------------|--------------|
| Admin        | admin@aigenius.com       | Admin@123    |
| Premium_User | premium@aigenius.com     | Premium@123  |
| Free_User    | free@aigenius.com        | Free@123     |

---

## 🔌 API Endpoints

### Auth Routes

| Method | Endpoint            | Description                                  |
|--------|---------------------|----------------------------------------------|
| POST   | `/api/auth/login`   | Login → returns Access Token + sets cookie   |
| POST   | `/api/auth/refresh` | Uses httpOnly cookie → returns new Access Token |
| POST   | `/api/auth/logout`  | Revokes refresh token, clears cookie         |

### AI Routes (all require `Authorization: Bearer <token>`)

| Method | Endpoint                  | Required Role             |
|--------|---------------------------|---------------------------|
| GET    | `/api/ai/free-model`      | Any logged-in user        |
| POST   | `/api/ai/premium-model`   | Premium_User or Admin     |
| DELETE | `/api/ai/purge-cache`     | Admin only                |

---

## 🔐 Authentication Flow

```
1. POST /api/auth/login
   → Verifies password with bcrypt
   → Issues Access Token (15m) in JSON response
   → Issues Refresh Token (7d) in httpOnly cookie

2. Client uses Access Token in Authorization header:
   Authorization: Bearer <access_token>

3. When Access Token expires (401):
   POST /api/auth/refresh
   → Reads Refresh Token from cookie
   → Validates against whitelist
   → Issues new Access Token

4. Unauthorized role → 403 Forbidden
   Expired/invalid token → 401 Unauthorized
```

---

## 🧪 Testing with Postman

1. Import `AI-Genius.postman_collection.json` into Postman.
2. Run requests in order (Login first — token auto-saved to collection variable).
3. Test each scenario: ✅ success, ❌ 401, ❌ 403.

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (salt rounds: 12)
- JWT secrets stored in `.env` via **dotenv**
- Refresh Token in **httpOnly + secure + sameSite=strict** cookie
- Refresh Token **whitelist** to allow revocation
- **Centralized error handling** for all JWT and operational errors
- Payload contains only `id`, `email`, `role` — **no passwords**
