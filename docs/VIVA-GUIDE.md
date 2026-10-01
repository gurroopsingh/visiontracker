# VisionTracker — Phase 1 Viva Preparation Guide
**Student: Gurroop Singh | Course: 24CAI0303 | Chitkara University**

---

# SECTION 1 — PROJECT: EVERY MEMBER MUST KNOW

## Problem Statement
Students on campus lose belongings every day. The existing process is informal — WhatsApp groups, physical notice boards, word of mouth. There is no central tracking system, no structured search, and no matching between lost and found reports. VisionTracker is a structured digital platform where students can report lost or found items and browse a searchable, categorized feed. Phase 2 will add AI image matching to automatically pair lost reports with found items.

## Main Features (Phase 1)
- Student registration and login with JWT
- Dashboard with live item statistics
- Lost and Found item feeds with search and category filters
- Item detail page with owner-only delete
- Report Lost Item form and Report Found Item form
- User profile showing own reports

## Technology Stack & Why Each Was Chosen

| Tech | Layer | Why |
|------|-------|-----|
| React 19 | Frontend UI | Component-based, efficient re-renders |
| Vite | Build tool | Fast dev server with HMR |
| Tailwind CSS v4 | Styling | Utility-first, no separate CSS files needed |
| React Router v7 | Routing | Nested routes, protected routes, route params |
| Axios | HTTP client | Interceptors for auto-attaching JWT; cleaner than fetch |
| Context API | Global state | Lightweight auth state management without Redux overhead |
| Node.js | Runtime | JavaScript on the server, non-blocking I/O |
| Express.js | API framework | Minimal, easy routing and middleware |
| MongoDB | Database | Schema-flexible, good for varied item data |
| Mongoose | ODM | Schema validation, hooks, relationships via populate |
| bcryptjs | Security | Industry-standard password hashing |
| jsonwebtoken | Auth | Stateless JWT — no server session storage needed |
| dotenv | Config | Keeps secrets out of source code |
| cors | Security | Allows frontend (port 5173) to call backend (port 5000) |

---

## Complete System Architecture

```
Browser (http://localhost:5173)
  └── React + Vite SPA
       └── AuthContext (global user/token state)
       └── React Router (public + protected routes)
       └── Pages call → services/authService.js / itemService.js
            └── api.js (Axios instance, baseURL=/api, JWT interceptor)
                 │
                 │ HTTP REST over Vite proxy → localhost:5000
                 ▼
       Express Server (server.js)
            └── CORS middleware
            └── express.json() body parser
            └── /api/health  (public)
            └── /api/auth    → authRoutes.js → authController.js
            └── /api/items   → itemRoutes.js → itemController.js
                 └── protect middleware (JWT verify)
                 └── errorHandler middleware
                 │
                 │ Mongoose
                 ▼
       MongoDB (local URI or automatic in-memory fallback)
            └── users collection (User model)
            └── items collection (Item model, ref → User)
```

---

## Key Flows — Speak These Out Loud

### Server Startup
1. `server.js` runs `import "dotenv/config"` → loads `.env`
2. Calls `connectDB()` → tries `mongoose.connect(MONGODB_URI)` with 2s timeout
3. If local MongoDB not running → falls back to `MongoMemoryServer` (in-memory)
4. Express app created, middleware added (CORS, body-parser)
5. Routes mounted: `/api/auth`, `/api/items`
6. Error handler registered LAST
7. `app.listen(5000)` → server ready

### Registration Flow
1. User fills RegisterPage form (controlled component with useState)
2. Frontend validates (name, email format, password ≥ 6 chars)
3. `register()` in authService.js → `api.post("/auth/register", {name,email,password})`
4. Axios sends POST to `/api/auth/register` (proxy → Express port 5000)
5. `authController.register` runs:
   - Checks required fields
   - Checks duplicate email (`User.findOne({email})`)
   - `User.create({...})` → triggers bcrypt pre-save hook → password hashed with salt 12
   - `generateToken(user._id)` → `jwt.sign({id}, JWT_SECRET, {expiresIn:"7d"})`
   - Returns `{success, token, user}`
6. `loginUser(data.user, data.token)` called on AuthContext
7. Token saved to `localStorage("vt_token")`
8. `navigate("/dashboard")`

### Login Flow
1. User fills LoginPage form
2. `loginService({email,password})` → `api.post("/auth/login")`
3. `authController.login`:
   - `User.findOne({email}).select("+password")` — password is excluded by default, must explicitly select
   - `user.comparePassword(password)` → `bcrypt.compare(input, hash)`
   - If match → `generateToken(user._id)` → returns token
4. Same as registration: `loginUser()` → localStorage → navigate to /dashboard

### JWT Generation & Verification Flow
- **Generation**: `generateToken(id)` → `jwt.sign({id}, JWT_SECRET, {expiresIn:"7d"})` in `generateToken.js`
- **Storage**: frontend stores token in `localStorage("vt_token")`
- **Attachment**: Every Axios request goes through the request interceptor in `api.js` → reads `localStorage.getItem("vt_token")` → adds `Authorization: Bearer <token>` header
- **Verification**: `protect` middleware in `authMiddleware.js` → reads `req.headers.authorization`, splits "Bearer " prefix, calls `jwt.verify(token, JWT_SECRET)` → decodes `{id}` → fetches `User.findById(decoded.id).select("-password")` → attaches to `req.user` → calls `next()`

### Protected Route Flow (Frontend)
1. User visits `/dashboard`
2. React Router hits `<ProtectedRoute>` component
3. `useAuth()` called → gets `{user, loading}` from AuthContext
4. If `loading === true` → shows spinner (prevents flashing login for valid sessions)
5. If `loading === false` AND `user === null` → `<Navigate to="/login" replace />`
6. If `user` exists → renders `<Outlet />` (the actual dashboard page)

### Authentication State on Page Refresh
1. App mounts → `AuthProvider` runs
2. `useState(() => localStorage.getItem("vt_token"))` → reads token from localStorage
3. `useEffect` fires → calls `getMe()` → `api.get("/auth/me")`
4. `protect` middleware verifies token on backend
5. If valid: `setUser(data.user)` → user stays logged in
6. If invalid/expired: clears localStorage, sets `user = null` → redirected to login

### Item Creation Flow (Lost or Found)
1. User fills ReportLostPage/ReportFoundPage (controlled form)
2. Form validates required fields
3. `reportLostItem(payload)` / `reportFoundItem(payload)` from itemService.js
4. `api.post("/items/lost", payload)` — Axios interceptor auto-adds JWT
5. Express: `protect` middleware verifies JWT → attaches `req.user`
6. `itemController` creates item: `Item.create({...payload, reportedBy: req.user._id, type: "lost"})`
7. Returns created item → frontend navigates to items feed

### Item Retrieval Flow
1. `ItemsListPage` mounts → `useEffect` fires
2. `getItems({type:"lost"})` → `api.get("/items?type=lost")`
3. No auth required — public endpoint
4. `itemController.getItems` → `Item.find({type, status:"active"})` with pagination
5. `.populate("reportedBy", "name email")` — fetches user name for display
6. Returns items array → rendered as `<ItemCard>` components

### Error Handling Flow
1. Controller catches error → `next(error)` or throws with `res.statusCode = 4xx`
2. `errorHandler` middleware intercepts (4 params: err, req, res, next)
3. Handles special cases: CastError (bad ID), 11000 (duplicate key), ValidationError, JWT errors
4. Returns `{success: false, message}` JSON
5. On frontend: Axios response interceptor catches non-2xx → extracts `error.response.data.message` → creates `new Error(message)` → caught in component catch block → `setError(err.message)` → displayed in `<Toast>`

---

## Database Models

### User Model (`models/User.js`)
```
name: String (required, max 80)
email: String (required, unique, lowercase)
password: String (required, min 6, select:false — never returned in queries)
role: String (enum: student/admin, default: student)
avatar: String (null in Phase 1)
timestamps: true (createdAt, updatedAt auto)
```
Pre-save hook: if password modified → `bcrypt.genSalt(12)` → `bcrypt.hash()`
Instance method: `comparePassword(candidate)` → `bcrypt.compare()`

### Item Model (`models/Item.js`)
```
type: String (enum: lost/found, required)
title: String (required, max 120)
description: String (required, max 1000)
category: String (enum: Electronics/Clothing/Books.../Other, required)
brand: String (optional)
color: String (optional)
location: String (required)
date: Date (required)
additionalDetails: String (optional)
imageUrl: String (null — Phase 2 Multer)
status: String (enum: active/resolved/closed, default: active)
reportedBy: ObjectId (ref: "User", required) ← RELATIONSHIP
timestamps: true
Indexes: type+status, category, reportedBy (for query performance)
```

### Relationship
Item has a `reportedBy` field which is a MongoDB ObjectId referencing the User collection. When querying items, `.populate("reportedBy", "name email")` replaces the ObjectId with the actual user document fields. This is a one-to-many relationship — one user can have many items.

---

## What is Persistent vs In-Memory

| Mode | Trigger | Data Persistence |
|------|---------|-----------------|
| Local MongoDB | `MONGODB_URI` connects | Persistent — survives server restart |
| MongoMemoryServer | Local MongoDB unavailable | NOT persistent — data lost on server restart |

In evaluation environments without MongoDB installed, the app still works via the fallback, but all data is cleared when you stop the server.

---

# SECTION 2 — PHASE 1 vs PHASE 2

## IMPLEMENTED IN PHASE 1

| Topic | Where in Code |
|-------|--------------|
| React functional components | All `.jsx` files |
| useState | LoginPage, RegisterPage, forms, DashboardLayout |
| useEffect | AuthContext.jsx (token verify), ItemsListPage, DashboardPage |
| Controlled components | All form inputs with `value` + `onChange` |
| Form validation | LoginPage.validate(), RegisterPage.validate(), ReportLostPage.validate() |
| Loading states | `const [loading, setLoading] = useState(false)` in forms |
| Error states | `const [error, setError] = useState("")` + Toast display |
| Conditional rendering | ProtectedRoute (loading → spinner, !user → redirect) |
| React Router / BrowserRouter | App.jsx |
| Nested routes | `<Route element={<ProtectedRoute>}><Route element={<DashboardLayout>}>...` |
| Route parameters | `/dashboard/items/:id` → `useParams()` in ItemDetailPage |
| Protected routes | ProtectedRoute.jsx |
| Context API / useContext | AuthContext.jsx + `useAuth()` hook |
| Axios + instance | api.js (`axios.create`) |
| Request interceptor | api.js — attaches JWT |
| Response interceptor | api.js — extracts error messages |
| Tailwind CSS | index.css + all components |
| Node.js | backend runtime |
| Express.js | server.js |
| REST API | 10 endpoints in authRoutes + itemRoutes |
| async/await | All controllers and services |
| Middleware | protect (auth), errorHandler (centralized errors) |
| JWT | generateToken.js + authMiddleware.js |
| bcrypt | User.js pre-save hook + comparePassword method |
| Mongoose schemas/models | User.js, Item.js |
| MongoDB | database layer (local or in-memory) |
| populate | itemController.getItems, getItemById |
| CRUD | Create (POST), Read (GET), Update (PUT), Delete (DELETE) for items |
| CORS | server.js cors() middleware |
| Environment variables | dotenv, .env file |

## PLANNED FOR PHASE 2 (NOT implemented)

| Feature | What it will do in VisionTracker |
|---------|----------------------------------|
| **Multer** | Middleware to handle multipart/form-data file uploads. Will save item images to disk or cloud storage and populate `imageUrl` in the Item model |
| **FastAPI/Python** | A separate microservice that accepts item images and returns AI-generated vector embeddings using the CLIP model |
| **AI/CLIP image matching** | When a lost item is reported with a photo, the system will compare its embedding vector against all found item embeddings and rank potential matches by cosine similarity |
| **Socket.IO** | Real-time WebSocket communication. When AI finds a match, it will push an instant notification to the relevant user's browser without page refresh |
| **Redis** | In-memory cache layer for item feeds. Instead of querying MongoDB on every request, frequently accessed item lists will be served from Redis with a TTL |
| **Docker/Docker Compose** | Containerizes all services (React, Express, FastAPI, MongoDB, Redis) into a reproducible multi-container environment |
| **Kubernetes** | Orchestrates the containerized services in production with auto-scaling, load balancing, and health monitoring |

---

# SECTION 3 — CLO / LECTURE MAPPING

## CLO01 — Backend Fundamentals (Lectures 1–30)
**File: `backend/src/config/db.js`**  
Demonstrates: Environment variables, async/await, Node.js module system  
`connectDB()` reads `process.env.MONGODB_URI`, tries `mongoose.connect()`. If it fails within 2 seconds, dynamically imports `mongodb-memory-server`, starts it, and connects to the in-memory URI. Shows error handling, async/await, and modular design.

**File: `backend/src/server.js`**  
Demonstrates: HTTP server creation, request-response lifecycle, environment config  
`import "dotenv/config"` loads .env. `express()` creates app. Middleware registered in order. Routes mounted. Error handler last. `app.listen(PORT)`.

## CLO02 — Node.js / Express / REST API (Lectures 49–60)
**Files: `authRoutes.js`, `itemRoutes.js`, `authController.js`, `itemController.js`**  
Demonstrates: Express routing, controllers, middleware, REST methods, status codes  

authRoutes.js:
```js
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe); // protect is middleware
```
The `protect` middleware runs BEFORE `getMe` controller. If JWT invalid → 401 returned, `getMe` never runs.

**CLO02 — React (Lectures 31–48)**  
Files: All frontend pages  
useState: Every form field is a controlled component — `const [email, setEmail] = useState("")` + `value={email}` + `onChange={(e)=>setEmail(e.target.value)}`  
useEffect: AuthContext verifies token on mount, ItemsListPage fetches items on mount  
Context API: `createContext`, `AuthProvider`, `useContext` abstracted into `useAuth()` hook  
React Router: BrowserRouter wraps everything, Routes define path-element pairs, Outlet renders nested child routes  

## CLO03 — Database & Security (Lectures 55–60)
**File: `backend/src/models/User.js`**  
Mongoose Schema with validation rules, pre-save hook for bcrypt, instance method for password comparison.

**File: `backend/src/middleware/authMiddleware.js`**  
JWT verification. Reads Bearer token from Authorization header. `jwt.verify()` decodes payload. `User.findById()` fetches live user. Attaches to `req.user`. Calls `next()`.

**File: `backend/src/utils/generateToken.js`**  
`jwt.sign({id}, JWT_SECRET, {expiresIn:"7d"})` — payload contains user ID only, signed with secret, expires in 7 days.
