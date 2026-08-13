# VisionTracker — Phase 1 Documentation

**Course:** Back End Engineering (24CAI0303)  
**University:** Chitkara University  
**Evaluation:** First Project Evaluation

---

## Phase 1 Scope

Phase 1 establishes the **core frontend and backend foundation** required to demonstrate all CLO topics for the first evaluation. It is intentionally scoped to exclude advanced features that belong to Phase 2.

---

## What Is Included in Phase 1

### Frontend (React + Vite + Tailwind CSS)

| Feature | Status |
|---------|--------|
| Landing page with branding and CTA | ✅ Done |
| Login page (controlled form) | ✅ Done |
| Registration page (controlled form) | ✅ Done |
| Dashboard overview with stats | ✅ Done |
| Lost items feed with search + filter | ✅ Done |
| Found items feed with search + filter | ✅ Done |
| Item detail page with route param | ✅ Done |
| Report Lost form (controlled, validated) | ✅ Done |
| Report Found form with image UI | ✅ Done |
| Profile page with user's own reports | ✅ Done |
| 404 Not Found page | ✅ Done |
| AuthContext (global auth state) | ✅ Done |
| ProtectedRoute (dashboard guard) | ✅ Done |
| DashboardLayout (sidebar + header) | ✅ Done |
| Axios service layer (api/auth/item) | ✅ Done |
| Loading states on all async pages | ✅ Done |
| Error states on all async pages | ✅ Done |
| Empty states on all list pages | ✅ Done |
| Responsive design (mobile + desktop) | ✅ Done |

### Backend (Node.js + Express + MongoDB)

| Feature | Status |
|---------|--------|
| Express REST API | ✅ Done |
| POST /api/auth/register | ✅ Done |
| POST /api/auth/login | ✅ Done |
| GET /api/auth/me | ✅ Done |
| GET /api/items (with filters) | ✅ Done |
| GET /api/items/:id | ✅ Done |
| POST /api/items/lost | ✅ Done |
| POST /api/items/found | ✅ Done |
| PUT /api/items/:id | ✅ Done |
| DELETE /api/items/:id | ✅ Done |
| JWT authentication middleware | ✅ Done |
| Centralized error middleware | ✅ Done |
| CORS configuration | ✅ Done |
| MongoDB + Mongoose connection | ✅ Done |
| User model with bcrypt password hashing | ✅ Done |
| Item model with ObjectId ref to User | ✅ Done |
| Environment variables (.env) | ✅ Done |
| Health check endpoint | ✅ Done |

---

## What Is NOT in Phase 1 (Intentionally Deferred)

| Feature | Phase |
|---------|-------|
| Redis caching | Phase 2 |
| Socket.IO real-time notifications | Phase 2 |
| FastAPI / Python AI service | Phase 2 |
| Image upload with Multer | Phase 2 |
| AI image embedding / CLIP model | Phase 2 |
| AI similarity matching | Phase 2 |
| Match confidence scoring | Phase 2 |
| Docker / Docker Compose | Phase 2 |
| Kubernetes deployment | Phase 2 |
| Production deployment | Phase 2 |
| Email notifications | Phase 2 |

---

## CLO Topics Demonstrated

| CLO Topic | Demonstrated |
|-----------|-------------|
| React Functional Components | ✅ All 15+ components |
| useState | ✅ 30+ state variables across 8 pages |
| useEffect | ✅ 5 meaningful side effects |
| Controlled Components | ✅ All 4 forms |
| React Router (BrowserRouter/Routes/Route) | ✅ App.jsx |
| React Router (Link/NavLink) | ✅ Nav + sidebar |
| React Router (nested routes) | ✅ /dashboard/* |
| React Router (route params) | ✅ /dashboard/items/:id |
| Protected Routes | ✅ ProtectedRoute.jsx |
| Context API (createContext) | ✅ AuthContext.jsx |
| Context API (Provider) | ✅ App.jsx |
| Context API (useContext) | ✅ 6 components |
| Axios (centralized client) | ✅ services/api.js |
| Axios (interceptors) | ✅ JWT + error |
| Tailwind CSS | ✅ Every file |
| Node.js + Express | ✅ server.js |
| REST API | ✅ 10 endpoints |
| async/await | ✅ All controllers |
| Middleware | ✅ auth + error |
| Error handling | ✅ Centralized |
| Environment variables | ✅ dotenv |
| MongoDB + Mongoose | ✅ db.js + models |
| Mongoose schemas/models | ✅ User.js + Item.js |
| CORS | ✅ server.js |

---

## Setup for Evaluation

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017
- npm

### Backend
```bash
cd backend
cp .env.example .env  # edit MONGODB_URI and JWT_SECRET
npm install
npm run dev           # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev           # runs on http://localhost:5173
```

### Test Flow
1. Open `http://localhost:5173`
2. Register a new account
3. Log in → lands on dashboard
4. Report a lost item
5. Report a found item
6. Browse Lost Items feed → search + filter
7. Open an item → detail page
8. Check Profile → see own reports
9. Sign out → redirect to login

---

## Known Phase 1 Limitations

1. Image upload is UI-only — `POST /items/found` accepts JSON only (Multer integration in Phase 2)
2. Profile items are filtered client-side — Phase 2 will add a `GET /api/items/my` endpoint
3. No email verification on registration
4. JWT refresh tokens not implemented (Phase 2)
5. Edit item (PUT) is wired in backend but frontend edit page is Phase 2
