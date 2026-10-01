
---

# SECTION 7 — VIVA QUESTION BANK (GURROOP SINGH)

## A. Project Overview

**Q: What is VisionTracker?**  
A: VisionTracker is a campus Lost & Found web application built as a MERN stack project. Students can register, report lost or found items, browse a searchable feed, and view item details. Phase 1 establishes the complete frontend and backend foundation. Phase 2 will add AI image matching to automatically pair lost reports with found items.

**Q: What problem does it solve?**  
A: The existing process on campus is informal — WhatsApp groups, notice boards, word of mouth. There's no central system, no search, and no matching. VisionTracker provides a structured digital platform with proper authentication, categorized search, and a clear reporting workflow.

---

## B. Architecture

**Q: How does the frontend talk to the backend?**  
A: The frontend uses Axios with `baseURL: "/api"`. In development, Vite proxies `/api` requests to `localhost:5000`. So when a component calls `api.post("/auth/login")`, Axios sends it to `/api/auth/login`, Vite proxies it to `http://localhost:5000/api/auth/login`, and Express handles it.

**Q: Why are there two ports — 5173 and 5000?**  
A: They are two separate servers. Vite runs the React app on port 5173. Express runs the REST API on port 5000. The Vite proxy bridges them so the frontend and backend can be developed independently.

---

## C. React

**Q: What is a functional component?**  
A: A functional component is a JavaScript function that returns JSX. For example, `const LoginPage = () => { return (<div>...</div>); }`. All our components are functional. We use hooks like useState and useEffect for state and side effects.

**Q: What is JSX?**  
A: JSX is a syntax extension that looks like HTML inside JavaScript. React compiles it to `React.createElement()` calls. It lets us write UI structure directly in the component function.

---

## D. useState / useEffect

**Q: What is useState and where do you use it?**  
A: `useState` is a React hook that adds state to a functional component. I use it in LoginPage for `const [email, setEmail] = useState("")` — email is the current value, setEmail is the function to update it. When setEmail is called, React re-renders the component with the new value.

**Q: What is useEffect and when does it run?**  
A: `useEffect` runs side effects after a component renders. The dependency array controls when it re-runs. In AuthContext I use `useEffect(() => { verifyToken(); }, [])` — the empty array `[]` means it runs exactly once when the component mounts, not on every re-render.

**Q: What is the dependency array?**  
A: The second argument of useEffect. `[]` = run once on mount. `[id]` = run every time `id` changes. No array = run after every render. In AuthContext we use `[]` because we only want to verify the token once when the app loads.

---

## E. Context API

**Q: What is Context API and why do you use it?**  
A: Context API is React's built-in solution for sharing state across components without prop drilling. We use it for authentication state — the logged-in user and token need to be accessible in many components: ProtectedRoute, DashboardLayout, ProfilePage, ItemDetailPage. Instead of passing them as props through every level, Context makes them globally accessible.

**Q: What is prop drilling?**  
A: Prop drilling is when you pass data from a parent component through multiple intermediate children just to reach a deeply nested child that needs it. Context API solves this by letting any component consume the context directly.

**Q: How do you consume the context in a component?**  
A: By calling the `useAuth()` custom hook: `const { user, loginUser, logout } = useAuth()`. That hook internally calls `useContext(AuthContext)` and returns everything the AuthProvider exposes.

---

## F. React Router

**Q: What is React Router?**  
A: React Router is a library for client-side routing in React. It renders different components based on the current URL without making server requests. We use BrowserRouter with the HTML5 history API.

**Q: What is a nested route?**  
A: When one Route is placed inside another in the JSX. The parent renders and uses `<Outlet />` to render the matched child. Our structure: ProtectedRoute (checks auth) wraps DashboardLayout (sidebar) wraps individual pages.

**Q: How does the Outlet work?**  
A: `<Outlet />` is a placeholder that React Router fills with the matched child route's component. DashboardLayout renders the sidebar and header, then renders `<Outlet />` in the main content area. Whatever page is currently active (Dashboard, ItemsList, etc.) gets rendered in that spot.

**Q: What is useNavigate?**  
A: A React Router hook that gives you a `navigate` function for programmatic navigation. After login, I call `navigate("/dashboard")` to redirect the user. After logout, I call `navigate("/login")`.

**Q: What is useParams?**  
A: A hook that extracts dynamic URL parameters. For `/dashboard/items/:id`, calling `const { id } = useParams()` gives me the actual item ID from the URL to fetch that specific item.

---

## G. Axios / API Integration

**Q: What is an Axios interceptor?**  
A: A function that runs before every request or after every response. The request interceptor in api.js reads the JWT from localStorage and adds it as the Authorization header. The response interceptor catches all errors and normalizes them to a standard Error object.

**Q: Why not use fetch instead of Axios?**  
A: Fetch doesn't have built-in interceptors, doesn't automatically parse JSON, and doesn't throw on 4xx/5xx responses (you have to check `response.ok` manually). Axios handles all of this and adds interceptors which are essential for cleanly managing JWT attachment.

---

## H. Authentication / JWT

**Q: What is JWT?**  
A: JSON Web Token. A compact, self-contained token with three parts: Header (algorithm), Payload (user ID, expiry), Signature (HMAC with secret). The backend signs it with `JWT_SECRET`. Any server with the same secret can verify it without a database lookup.

**Q: How does JWT authentication work in our project?**  
A: 1) User logs in → backend generates `jwt.sign({id}, secret, {expiresIn:"7d"})`. 2) Frontend stores it in localStorage. 3) Axios request interceptor adds `Authorization: Bearer <token>` to all API calls. 4) `protect` middleware on the backend calls `jwt.verify(token, secret)` → extracts `{id}` → fetches user from DB → attaches to `req.user`.

**Q: What happens when the JWT expires?**  
A: `jwt.verify()` throws `TokenExpiredError`. The `protect` middleware returns HTTP 401. The Axios response interceptor catches it and returns `new Error("Token is invalid or expired.")`. On the next page load or API call, AuthContext's `getMe()` will fail and clear localStorage, redirecting the user to login.

**Q: What is bcrypt and why use it?**  
A: bcrypt is a password hashing library. It generates a random salt and produces an irreversible hash. We never store plain text passwords. In User.js, the pre-save hook runs `bcrypt.genSalt(12)` and `bcrypt.hash(password, salt)` before saving. On login, `bcrypt.compare(input, hash)` checks the match.

**Q: What is authentication vs authorization?**  
A: Authentication = proving who you are (login, JWT verification). Authorization = proving you have permission to do something (e.g., only the item owner can delete their report). In our `protect` middleware we authenticate. In `itemController.deleteItem` we additionally check `if (item.reportedBy.toString() !== req.user._id.toString())` — that's authorization.

---

## I. Backend Understanding

**Q: What is middleware in Express?**  
A: A function with signature `(req, res, next)` that runs between the request and the response. Middleware can read/modify the request, call `next()` to pass to the next middleware/route, or end the response. We have: `cors()`, `express.json()`, `protect`, and `errorHandler`.

**Q: Why is the error handler registered last?**  
A: Error middleware has 4 parameters: `(err, req, res, next)`. Express identifies it as an error handler by the 4-parameter signature. It must be registered after all routes because it only catches errors from those routes. If registered first, it would never receive any errors.

**Q: What is the difference between routes and controllers?**  
A: Routes define URL patterns and which controller function to call. Controllers contain the actual business logic — database queries, response formatting. This separation means routes stay clean (just mapping), controllers stay focused (just logic).

---

## J. MongoDB / Mongoose

**Q: What is Mongoose?**  
A: Mongoose is an ODM (Object Document Mapper) for MongoDB. It lets us define schemas with validation rules, creates models from those schemas, and provides methods like `Model.find()`, `Model.create()`, `Model.findById()`. It also supports middleware hooks and virtual fields.

**Q: What is populate?**  
A: MongoDB stores a relationship as an ObjectId reference. `.populate("reportedBy", "name email")` replaces that ObjectId with the actual User document fields (name, email). This is how we show who reported each item without a separate query.

**Q: What are Mongoose indexes?**  
A: In Item.js we define `itemSchema.index({ type: 1, status: 1 })`. This tells MongoDB to maintain a sorted index on those fields so queries filtering by type and status are fast. Without indexes, MongoDB scans every document — with indexes it uses the sorted structure for O(log n) lookup.

---

## K. Error Handling

**Q: How does error handling work end-to-end?**  
A: Backend: controller catches error, sets `res.statusCode`, calls `next(error)`. errorMiddleware intercepts, identifies the error type (Mongoose validation, JWT error, duplicate key), formats a clean JSON `{success:false, message}`. Frontend: Axios response interceptor catches non-2xx, extracts `error.response.data.message`, throws `new Error(message)`. Component catch block sets `setError(err.message)`. Toast component displays it to the user.

---

## L. My Contribution

**Q: What exactly did you build?**  
A: I was responsible for the authentication layer and global state management. Specifically: the Login and Register pages with controlled forms, validation, and error handling; the AuthContext which manages global user state and persists sessions via localStorage; the Axios api.js instance with JWT request interceptors and error response normalization; the authService functions; App.jsx routing configuration; ProtectedRoute guard; DashboardLayout with sidebar and logout; and the ItemDetailPage with inline delete confirmation. I also implemented the MongoDB memory fallback in db.js.

---

## M. Git / Commits

**Q: How can we see individual contributions?**  
A: Run `git log --oneline --author="gurroopsingh"` to see my commits. Each commit has a descriptive message following conventional commits format (feat, fix, chore) that clearly states what was changed.

---

## N. Design Decisions

**Q: Why Context API instead of Redux?**  
A: Redux is powerful but adds significant complexity — actions, reducers, selectors, store setup. For our authentication state (user + token + loading + loginUser + logout), Context API is perfectly sufficient and requires zero extra dependencies.

**Q: Why Axios instead of fetch?**  
A: Interceptors. The ability to automatically attach the JWT to every request in one place (request interceptor) and normalize all API errors in one place (response interceptor) would require significantly more repetitive code using fetch.

**Q: Why not store JWT in cookies?**  
A: For this phase, localStorage is simpler and sufficient for a campus application. Cookies with HttpOnly flag are more secure against XSS but require additional server-side configuration. This is a valid Phase 2 security improvement.

---

## O. Debugging / Scenario Questions

**Q: A user registers successfully but is redirected to login instead of dashboard. What could be wrong?**  
A: Check `loginUser()` is being called after registration. Check that `data.token` and `data.user` exist in the response. Check if `localStorage.setItem("vt_token", ...)` is executing. Check ProtectedRoute — is `loading` stuck on true?

**Q: The frontend shows "Something went wrong" instead of a specific error. Why?**  
A: The Axios response interceptor uses a fallback chain: `error.response?.data?.message || error.message || "Something went wrong."`. This generic message appears if the backend doesn't return a `message` field, or the network is down (no response object at all).

**Q: Items posted in one session disappear after server restart. Why?**  
A: The server is using the MongoMemoryServer fallback (local MongoDB wasn't running). In-memory databases don't persist data. When the server restarts, MongoMemoryServer creates a fresh empty database.

---

# SECTION 8 — "SHOW ME WHERE" ANSWERS

| Question | Answer |
|----------|--------|
| Where is Context API implemented? | `frontend/src/context/AuthContext.jsx` — `createContext`, `AuthProvider`, `useContext` |
| Where is useEffect used? | `AuthContext.jsx` line 23 (token verify on mount); `ItemsListPage.jsx` (fetch items); `DashboardPage.jsx` (stats) |
| Where is Axios configured? | `frontend/src/services/api.js` — `axios.create({baseURL:"/api"})` |
| Where is JWT generated? | `backend/src/utils/generateToken.js` — `jwt.sign({id}, JWT_SECRET, {expiresIn:"7d"})` |
| Where is JWT verified? | `backend/src/middleware/authMiddleware.js` — `jwt.verify(token, process.env.JWT_SECRET)` |
| Where is the protected route? | `frontend/src/components/ProtectedRoute.jsx` |
| Where is routing configured? | `frontend/src/App.jsx` — BrowserRouter, Routes, nested Route elements |
| Where are controlled components? | `LoginPage.jsx`, `RegisterPage.jsx`, `ReportLostPage.jsx`, `ReportFoundPage.jsx` |
| Where is error handling (backend)? | `backend/src/middleware/errorMiddleware.js` — errorHandler function |
| Where is Mongoose schema defined? | `backend/src/models/User.js` and `backend/src/models/Item.js` |
| Where is authentication middleware? | `backend/src/middleware/authMiddleware.js` — `protect` function |
| Where is the database connection? | `backend/src/config/db.js` — `connectDB()` |
| Where does login call the backend? | `frontend/src/services/authService.js` — `api.post("/auth/login", ...)` |
| Where is the logged-in user stored globally? | `frontend/src/context/AuthContext.jsx` — `const [user, setUser] = useState(null)` |
| Where does logout happen? | `frontend/src/layouts/DashboardLayout.jsx` — `handleLogout()` calls `logout()` then `navigate("/login")` |
| Where is the API response handled? | `frontend/src/services/api.js` — response interceptor; individual catch blocks in pages |
| Where is bcrypt used? | `backend/src/models/User.js` — pre-save hook (hash) and `comparePassword` method |
| Where is populate used? | `backend/src/controllers/itemController.js` — `.populate("reportedBy", "name email")` |
| Where is CORS configured? | `backend/src/server.js` — `app.use(cors({origin: process.env.CLIENT_URL}))` |

---

# SECTION 9 — PROFESSOR CROSS-QUESTIONS

**Q: What happens if MongoDB is unavailable?**  
A: `connectDB()` attempts `mongoose.connect(MONGODB_URI)` with a 2-second timeout. If it fails, the catch block dynamically imports `mongodb-memory-server`, creates an in-memory MongoDB instance, and connects to it. The server starts normally — data just isn't persistent.

**Q: What happens after page refresh?**  
A: AuthProvider mounts → reads token from localStorage → calls `GET /api/auth/me` with token → if valid, restores user session → ProtectedRoute gets `user` from context → dashboard renders. If invalid, localStorage is cleared and user sees login page.

**Q: What happens if an unauthorized user tries to access /dashboard directly?**  
A: React Router matches the `/dashboard` path → hits `<ProtectedRoute>`. `useAuth()` returns `user = null`. `<Navigate to="/login" replace />` immediately redirects them. They never see the dashboard content.

**Q: What happens if the API is down?**  
A: Axios throws a network error (no `error.response`). The response interceptor falls back to `error.message` which is something like "Network Error". The component's catch block sets `setError("Network Error")` and Toast shows it.

**Q: Where exactly is the database operation performed?**  
A: In the controller functions in `authController.js` and `itemController.js`. For example, `User.create({name, email, password})` in the register controller. Mongoose translates this to a MongoDB `insertOne` operation.

**Q: How does the frontend know the user is logged in?**  
A: Through AuthContext. Any component calling `const { user } = useAuth()` gets the current user object if logged in, or `null` if not. The `user` state in AuthContext is the single source of truth for authentication status.

**Q: Why separate controllers and routes?**  
A: Single responsibility. Routes only handle URL matching and middleware chaining. Controllers contain all business logic — validation, DB operations, response formatting. If the login logic changes, only `authController.js` needs updating, not the route file.

---

# SECTION 10 — DEMONSTRATION SCRIPT (5-7 Minutes)

**Step 1 — Explain Architecture (1 min)**  
Open two terminals. Point at backend terminal: "This is our Express server running on port 5000. Point at browser: This is our React app on port 5173. The frontend communicates with the backend through REST API calls. Let me show the code — here is server.js where Express is configured, here is App.jsx where all our React routes are defined."

**Step 2 — Register (1 min)**  
"Let me register a new student account." Open `/register`. Fill form. "Notice each field is a controlled component — the value is stored in React state using useState." Submit. "The form calls authService.js which uses our Axios instance. The backend creates the user, hashes the password with bcrypt, generates a JWT, and returns it. Our AuthContext stores it in localStorage and updates global user state. React Router navigates us to the dashboard."

**Step 3 — Show Dashboard & Items (1 min)**  
"We're now on the dashboard — only accessible because we're authenticated. ProtectedRoute checked our user state in AuthContext. The sidebar uses DashboardLayout which reads the user name from useAuth(). Let me navigate to Lost Items — this calls GET /api/items?type=lost, which Mongoose queries with populate to return items with reporter names."

**Step 4 — Report an Item (1 min)**  
"Let me report a lost item." Fill form. "Every input is controlled by useState. The submit handler validates client-side first, then calls itemService.js. The Axios request interceptor automatically attaches the JWT. The protect middleware on the backend verifies it, attaches req.user, and the controller creates the item with reportedBy set to my user ID."

**Step 5 — Show API with JWT (1 min)**  
Open Postman or browser network tab. "Let me show the actual API. GET /api/auth/me without a token returns 401. With the JWT in the Authorization header, it returns my user profile. This is the protect middleware in authMiddleware.js — it uses jwt.verify() to decode the token and find the user."

**Step 6 — Show Source Files (1 min)**  
"Here are my key files: AuthContext.jsx — global state. api.js — Axios with interceptors. ProtectedRoute.jsx — auth guard. generateToken.js — JWT creation. authMiddleware.js — JWT verification. db.js — database connection with memory fallback."

**Step 7 — Phase 2 (30 sec)**  
"In Phase 2, when a user uploads a photo with their found item report, Multer will handle the file upload. A FastAPI Python microservice will generate a CLIP embedding of the image. These embeddings will be compared using cosine similarity to match lost items with found items. Socket.IO will send real-time notifications when a match is found."

---

# SECTION 11 — LAST 30 MINUTES RAPID REVISION

## 20 Most Important Concepts
1. Controlled component = input value in useState, not DOM
2. useEffect with [] = runs once on mount only
3. Context API = global state without prop drilling
4. useAuth() = custom hook consuming AuthContext
5. Axios interceptors = auto JWT attach + error normalize
6. ProtectedRoute uses Outlet to render child routes
7. JWT = Header.Payload.Signature, expires in 7d
8. bcrypt pre-save hook hashes password before DB insert
9. protect middleware = jwt.verify() + User.findById() + req.user
10. errorHandler has 4 params (err, req, res, next)
11. populate replaces ObjectId with actual user document
12. MongoMemoryServer = fallback when local MongoDB unavailable (NOT persistent)
13. Nested routes: ProtectedRoute → DashboardLayout → Page, connected by Outlet
14. useParams() extracts :id from URL path
15. localStorage stores JWT key "vt_token"
16. `select: false` on password field means never returned in queries by default
17. `select("+password")` explicitly retrieves it for login comparison
18. CORS allows port 5173 to call port 5000
19. `generateToken(user._id)` = jwt.sign({id}, SECRET, {expiresIn})
20. Vite proxy: /api requests → localhost:5000

## 20 Most Likely Questions
1. What is a controlled component?
2. What does useEffect with empty array do?
3. Why Context API instead of Redux?
4. What does the Axios interceptor do?
5. How does ProtectedRoute work?
6. What is JWT and how does it work?
7. Where is the JWT stored and why?
8. What is bcrypt?
9. How does the protect middleware work?
10. What is middleware in Express?
11. How do nested routes work?
12. What is populate in Mongoose?
13. What happens on page refresh?
14. What happens if MongoDB is unavailable?
15. Where is the database connection?
16. Authentication vs authorization — difference?
17. Why separate routes and controllers?
18. What is an Axios instance?
19. What is useParams?
20. What is the Outlet component?

## Key Files To Remember
- `frontend/src/context/AuthContext.jsx` — global auth state
- `frontend/src/services/api.js` — Axios instance + interceptors
- `frontend/src/services/authService.js` — auth API calls
- `frontend/src/App.jsx` — all routes defined here
- `frontend/src/components/ProtectedRoute.jsx` — auth guard
- `frontend/src/layouts/DashboardLayout.jsx` — sidebar + logout
- `frontend/src/pages/LoginPage.jsx` — login form
- `frontend/src/pages/RegisterPage.jsx` — register form
- `backend/src/server.js` — Express setup
- `backend/src/config/db.js` — MongoDB + fallback
- `backend/src/middleware/authMiddleware.js` — JWT verify
- `backend/src/middleware/errorMiddleware.js` — error handler
- `backend/src/models/User.js` — user schema + bcrypt
- `backend/src/models/Item.js` — item schema + indexes
- `backend/src/utils/generateToken.js` — jwt.sign

## Architecture Flow (Speak It)
User → React Component → Service function → Axios (adds JWT) → Vite proxy → Express → Route → Middleware (protect) → Controller → Mongoose → MongoDB → JSON response → Axios (normalize error) → Component state update → React re-render

## Authentication Flow
Register/Login → bcrypt hash → jwt.sign({id}) → localStorage("vt_token") → Axios interceptor adds Bearer header → protect middleware reads it → jwt.verify() → User.findById → req.user → controller runs

## Phase 2 Key Terms
- Multer = file upload middleware
- FastAPI = Python REST framework for AI service
- CLIP = AI model that generates image embeddings
- Cosine similarity = measures how similar two embedding vectors are
- Socket.IO = real-time bidirectional WebSocket communication
- Redis = in-memory key-value cache with TTL
- Docker = container technology
- Docker Compose = multi-container orchestration
- Kubernetes = production container orchestration with auto-scaling
