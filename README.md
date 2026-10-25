# VisionTracker — AI-Powered Campus Lost & Found

> **Course:** Back End Engineering (24CAI0303)  
> **University:** Chitkara University  
> **Phases:** Phase 1 (Frontend + REST API) · Phase 2 (AI Matching + Real-time) — Both Complete

---

## Problem Statement

Students on campus lose belongings daily — laptops, ID cards, water bottles, keys. The current process is informal: WhatsApp groups, noticeboard photos, word of mouth. There is no central system, no search, and no matching. VisionTracker solves this with a structured digital platform where students can report and browse lost and found items, upload photos, and receive AI-driven match alerts in real time.

---

## Features

| Feature | Status |
|---------|--------|
| User registration and login | ✅ Implemented |
| JWT authentication & protected routes | ✅ Implemented |
| Report Lost item (with image upload) | ✅ Implemented |
| Report Found item (with image upload) | ✅ Implemented |
| Browse and search items (filter, sort, paginate) | ✅ Implemented |
| Item detail page with owner edit/delete | ✅ Implemented |
| User profile with own reports | ✅ Implemented |
| Multer image upload (JPEG/PNG/WebP, 5 MB limit) | ✅ Implemented |
| CLIP-based AI image similarity matching | ✅ Implemented |
| Async match scan on every Found report | ✅ Implemented |
| Match document stored in MongoDB | ✅ Implemented |
| Match accept / reject by item owner | ✅ Implemented |
| Real-time Socket.IO notifications to item owner | ✅ Implemented |
| Redis caching for item feeds (graceful fallback) | ✅ Implemented |
| Rate limiting on auth routes | ✅ Implemented |
| EJS-rendered admin panel (`/admin`) | ✅ Implemented |
| In-memory MongoDB fallback (no local DB needed) | ✅ Implemented |
| Docker Compose (all services) | ✅ Manifests created, local dev only |
| Kubernetes manifests | ✅ Manifests created — **not deployed to a live cluster** |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| Vite | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| React Router v7 | Client-side routing |
| Axios | HTTP client |
| Socket.IO Client | Real-time notifications |
| Context API | Global authentication state |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js 20 | Runtime |
| Express.js | REST API framework |
| MongoDB / Mongoose | Database and ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| Multer | Multipart image upload |
| Socket.IO | Real-time WebSocket server |
| Redis (ioredis) | Item feed caching (optional) |
| express-rate-limit | Route-level rate limiting |
| EJS | Server-side admin view |
| Pino | Structured logging |
| mongodb-memory-server | Automatic in-memory DB fallback |

### AI Microservice
| Technology | Purpose |
|------------|---------|
| Python 3.10 + FastAPI | Microservice framework |
| OpenAI CLIP (`clip-vit-base-patch32`) | Visual similarity embeddings |
| HuggingFace Transformers | Model loading |
| PyTorch | Inference backend |
| Uvicorn | ASGI server |

---

## Architecture

```
Browser (React + Vite)
  ├─ Context API (auth state + JWT storage)
  ├─ Socket.IO Client (real-time match notifications)
  └─ Axios services (api.js / authService.js / itemService.js)
       │ HTTP REST
       ▼
Node.js + Express (localhost:5000)
  ├─ authRoutes  → authController  (register / login / /me)
  ├─ itemRoutes  → itemController  (CRUD + pagination + filters)
  │                matchController (list / accept / reject)
  ├─ uploadMiddleware (Multer — JPEG/PNG/WebP ≤ 5 MB)
  ├─ authMiddleware  (JWT verify)
  ├─ rateLimiter     (express-rate-limit)
  ├─ Socket.IO       (match_found → notify lost-item owner)
  ├─ Redis           (item-feed cache — falls back to DB if Redis unavailable)
  └─ matchService    (async CLIP scan on every Found report)
       │ HTTP POST /match
       ▼
FastAPI AI Service (localhost:8000)
  └─ CLIP model (openai/clip-vit-base-patch32)
       │ cosine similarity ≥ 0.75 → is_match
       ▼
MongoDB (local or automatic in-memory fallback)
  ├─ users collection
  ├─ items collection
  └─ matches collection
```

---

## Project Structure

```
visiontracker/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js          # MongoDB + in-memory fallback
│   │   │   └── socket.js      # Socket.IO init + user→socket map
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── itemController.js
│   │   │   └── matchController.js   # Accept / reject / list matches
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   ├── rateLimiter.js
│   │   │   └── uploadMiddleware.js  # Multer config + MIME filter
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Item.js
│   │   │   └── Match.js             # AI match record
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── itemRoutes.js        # Includes /matches routes
│   │   ├── services/
│   │   │   ├── aiService.js         # HTTP client → FastAPI
│   │   │   └── matchService.js      # Async CLIP scan trigger
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── logger.js            # Pino structured logger
│   │   ├── views/admin.ejs          # EJS admin page
│   │   └── server.js
│   ├── uploads/                     # Uploaded images (gitignored)
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── ai-service/
│   ├── main.py          # FastAPI: /health, /embed, /match, /match-batch
│   ├── run.py           # Uvicorn startup
│   ├── requirements.txt
│   ├── Dockerfile
│   └── venv/            # (local only, gitignored)
│
├── frontend/
│   ├── src/
│   │   ├── context/AuthContext.jsx
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ItemCard.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Toast.jsx
│   │   ├── layouts/DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ItemsListPage.jsx
│   │   │   ├── ItemDetailPage.jsx
│   │   │   ├── EditItemPage.jsx     # Phase 2: edit own reports
│   │   │   ├── ReportLostPage.jsx
│   │   │   ├── ReportFoundPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── itemService.js       # Includes getMatches / acceptMatch / rejectMatch
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── nginx.conf        # For Docker/production
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── k8s/
│   ├── 01-mongo.yaml
│   ├── 02-redis.yaml
│   ├── 03-backend.yaml
│   ├── 04-ai.yaml
│   └── 05-frontend.yaml
│
├── docs/
│   ├── Screenshots/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── AUDIT-REPORT.md
│   └── CLO-MAPPING.md
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## Setup Instructions

### Prerequisites

| Requirement | Notes |
|-------------|-------|
| Node.js v18+ | [nodejs.org](https://nodejs.org) |
| Python 3.10+ | For the AI service |
| MongoDB | **Optional** — app falls back to in-memory DB automatically |
| Redis | **Optional** — app skips caching gracefully if unavailable |

---

### 1. Clone the repository

```bash
git clone https://github.com/gurroopsingh/visiontracker.git
cd visiontracker
```

---

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in JWT_SECRET at minimum
npm install
npm run dev
```

Backend starts at `http://localhost:5000`  
Health check: `http://localhost:5000/api/health`

**Key `.env` variables:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/visiontracker
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
AI_MATCH_THRESHOLD=0.75
REDIS_URL=redis://localhost:6379
```

> If `MONGODB_URI` is unreachable, the server auto-starts an in-memory MongoDB instance. Data is lost on restart.  
> If Redis is unavailable, caching is silently skipped — the API still works normally.

---

### 3. AI service setup (required for matching)

```bash
cd ai-service
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

AI service starts at `http://localhost:8000`  
Health check: `http://localhost:8000/health`

> First startup downloads the CLIP model weights (~350 MB) from HuggingFace.

---

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`

---

### 5. Docker Compose (alternative — all services at once)

> **Note:** Docker Compose runs the full stack locally. Kubernetes manifests in `k8s/` exist for cluster deployment but have not been deployed to a live cluster.

```bash
# From the repository root:
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Service | http://localhost:8000 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | None | Health check + uptime |
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Get current user profile |

### Items

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/items` | None | List items (`?type`, `?category`, `?search`, `?page`, `?limit`, `?sort`) |
| GET | `/api/items/my` | JWT | Items reported by the current user |
| GET | `/api/items/:id` | None | Single item detail |
| POST | `/api/items/lost` | JWT | Report a lost item (multipart/form-data, optional `image`) |
| POST | `/api/items/found` | JWT | Report a found item (triggers AI match scan) |
| PUT | `/api/items/:id` | JWT (owner) | Update own item |
| DELETE | `/api/items/:id` | JWT (owner) | Delete own item |

### AI Matches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/items/matches` | JWT | List AI matches for the user's lost items |
| PATCH | `/api/items/matches/:id/accept` | JWT (owner) | Accept a match |
| PATCH | `/api/items/matches/:id/reject` | JWT (owner) | Reject a match |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin` | `ADMIN_SECRET` header | EJS admin dashboard |

### AI Microservice (port 8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service + model status |
| POST | `/match` | Compare two images → `{ similarity, match, threshold }` |
| POST | `/match-batch` | One image vs many candidates |

See [`docs/API.md`](docs/API.md) for full request/response schemas.

---

## AI Matching — How It Works

1. User reports a **Found** item and optionally uploads a photo.
2. The backend fires an **async** `runMatchSearch()` (non-blocking — response returns immediately).
3. `matchService.js` fetches all active **Lost** items that have images.
4. For each candidate, it calls `POST /match` on the FastAPI AI service.
5. The AI service computes **cosine similarity** between the two CLIP embeddings.
6. If `similarity ≥ 0.75`, a `Match` document is saved in MongoDB.
7. The lost-item owner receives a **real-time Socket.IO notification** (`notification` event, `type: "match"`).

**Verified similarity scores (from E2E test):**

| Pair | Score | Result |
|------|-------|--------|
| Same backpack (variant) | 0.9957 | ✅ MATCH |
| Backpack vs Bicycle | 0.7036 | ❌ NO MATCH |

---

## Real-Time Notifications

The frontend connects to Socket.IO on login. The client emits a `register` event with the user's `_id` to associate the socket with the user. When an AI match is found, the server emits a `notification` event directly to that socket:

```js
// Client side
socket.emit("register", user._id);
socket.on("notification", (payload) => {
  if (payload.type === "match") showToast(payload.message);
});
```

---

## Known Limitations

| Limitation | Detail |
|------------|--------|
| In-memory DB | Data is **not persistent** across server restarts when MongoDB is unavailable |
| Redis optional | No caching when Redis is not running (fallback to DB on every request) |
| AI service startup | CLIP model downloads ~350 MB on first run |
| Kubernetes | Manifests created and validated — **not deployed** to a live cluster |
| Socket.IO scaling | Single-server Socket.IO — not compatible with multi-replica deployments without Redis adapter |
| Image storage | Uploaded images saved to local `/uploads/` disk — not an object store |
| AI threshold | Default 0.75 cosine similarity — may produce false negatives on low-quality photos |

---

## Screenshots

<div align="center">
  <img src="docs/Screenshots/Dashboard.png" alt="Dashboard" width="48%">
  <img src="docs/Screenshots/Lost Items.png" alt="Lost Items Feed" width="48%">
  <img src="docs/Screenshots/Report Found.png" alt="Report Found Item" width="48%">
  <img src="docs/Screenshots/My Profile.png" alt="User Profile" width="48%">
  <img src="docs/Screenshots/13-api-auth-me.png" alt="API — /auth/me" width="48%">
  <img src="docs/Screenshots/14-api-get-items.png" alt="API — /items" width="48%">
</div>

---

## CLO Mapping

| CLO Topic | File |
|-----------|------|
| useState | `LoginPage.jsx`, `RegisterPage.jsx`, `ReportLostPage.jsx`, `ReportFoundPage.jsx`, `DashboardPage.jsx` |
| useEffect | `AuthContext.jsx`, `DashboardPage.jsx`, `ItemDetailPage.jsx`, `ProfilePage.jsx`, `ItemsListPage.jsx` |
| Controlled Components | All form pages |
| Context API | `frontend/src/context/AuthContext.jsx` |
| React Router (protected routes) | `frontend/src/App.jsx`, `ProtectedRoute.jsx` |
| Axios | `frontend/src/services/api.js` |
| Tailwind CSS | All frontend files |
| Express REST API | `backend/src/server.js`, `routes/`, `controllers/` |
| MongoDB + Mongoose | `backend/src/config/db.js`, `models/` |
| JWT Middleware | `backend/src/middleware/authMiddleware.js` |
| Error Middleware | `backend/src/middleware/errorMiddleware.js` |
| Multer (file upload) | `backend/src/middleware/uploadMiddleware.js` |
| Socket.IO | `backend/src/config/socket.js`, `matchService.js` |
| Redis caching | `backend/src/controllers/itemController.js` |
| Rate limiting | `backend/src/middleware/rateLimiter.js` |
| FastAPI + CLIP | `ai-service/main.py` |
| Docker | `docker-compose.yml`, `*/Dockerfile` |
| Kubernetes | `k8s/*.yaml` |

See [`docs/CLO-MAPPING.md`](docs/CLO-MAPPING.md) for the full detailed mapping.

---

## Team Contribution

| Member | Modules Owned |
|--------|---------------|
| **Ishpreet Singh** | Project initialization, Frontend architecture, Tailwind UI, Landing/404 pages, Docker Compose |
| **Himanshu Bansal** | Express REST API, MongoDB schemas, JWT security, Lost & Found feature interfaces, Redis caching, API documentation |
| **Gurroop Singh** | Auth UI, Context API, React Router, Socket.IO real-time, FastAPI AI service, Match workflow, Kubernetes manifests, E2E testing |

> Detailed contribution mapping available in [`docs/AUDIT-REPORT.md`](docs/AUDIT-REPORT.md).
