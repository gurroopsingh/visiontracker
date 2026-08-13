# VisionTracker — CLO Implementation Mapping
## Back End Engineering (24CAI0303) — Phase 1

This document maps every required Course Learning Outcome (CLO) topic to the exact file and code location where it is implemented.

---

## React Functional Components

**File:** `frontend/src/pages/LandingPage.jsx`  
**Also in:** Every page and component in `frontend/src/`  
**Purpose:** All UI is built with functional components using the `const ComponentName = () => { ... }` pattern. No class components are used anywhere.

---

## useState

### Login form state
**File:** `frontend/src/pages/LoginPage.jsx`
```js
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

### Registration form state
**File:** `frontend/src/pages/RegisterPage.jsx`
```js
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
```

### Report Lost Item form state
**File:** `frontend/src/pages/ReportLostPage.jsx`
```js
const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");
const [brand, setBrand] = useState("");
const [color, setColor] = useState("");
const [location, setLocation] = useState("");
const [date, setDate] = useState("");
const [additionalDetails, setAdditionalDetails] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
```

### Report Found Item form state
**File:** `frontend/src/pages/ReportFoundPage.jsx`  
**Purpose:** Same pattern as ReportLostPage, also includes `imageFile` state for the Phase 2 file upload UI.

### Search and filter state
**File:** `frontend/src/pages/ItemsListPage.jsx`
```js
const [items, setItems] = useState([]);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("All");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

### Dashboard stats and recent items
**File:** `frontend/src/pages/DashboardPage.jsx`
```js
const [lostCount, setLostCount] = useState(0);
const [foundCount, setFoundCount] = useState(0);
const [recentItems, setRecentItems] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
```

### Auth state in AuthContext
**File:** `frontend/src/context/AuthContext.jsx`
```js
const [user, setUser] = useState(null);
const [token, setToken] = useState(() => localStorage.getItem("vt_token"));
const [loading, setLoading] = useState(true);
```

### Sidebar open/close (modal state)
**File:** `frontend/src/layouts/DashboardLayout.jsx`
```js
const [sidebarOpen, setSidebarOpen] = useState(false);
```

---

## useEffect

### Verify stored JWT token on app mount
**File:** `frontend/src/context/AuthContext.jsx`  
**Purpose:** When the app loads, if a token exists in localStorage, calls `GET /api/auth/me` to verify it and restore the user session. Runs once on mount (`[]` dependency).

### Fetch dashboard stats on mount
**File:** `frontend/src/pages/DashboardPage.jsx`  
**Purpose:** Fetches lost and found item counts and builds the recent activity list when the Dashboard first renders. Dependency: `[]` (mount only).

### Fetch items list (with filter reactivity)
**File:** `frontend/src/pages/ItemsListPage.jsx`  
**Purpose:** Refetches items from the API when `type`, `category`, or `search` changes. The search input is debounced by 400ms using `setTimeout` inside `useEffect` to avoid excessive API calls.

### Fetch single item by route param
**File:** `frontend/src/pages/ItemDetailPage.jsx`  
**Purpose:** Fetches item data whenever the `id` route parameter changes. Dependency: `[id]`.

### Fetch user's own items for Profile
**File:** `frontend/src/pages/ProfilePage.jsx`  
**Purpose:** Fetches all items and filters by the logged-in user's id when the `user` object is available. Dependency: `[user]`.

---

## Controlled Components

**Files:** All form pages  
**Pattern demonstrated in** `frontend/src/pages/LoginPage.jsx`:

```jsx
<input
  id="login-email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="you@chitkara.edu.in"
/>
```

Every `<input>`, `<textarea>`, and `<select>` in the application uses `value` + `onChange` — none use uncontrolled refs.

---

## React Router

**File:** `frontend/src/App.jsx`

### BrowserRouter
```jsx
<BrowserRouter> ... </BrowserRouter>
```

### Routes / Route
```jsx
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  ...
</Routes>
```

### Link / NavLink
- `Link` used in: `LandingPage.jsx`, `NotFoundPage.jsx`, auth pages
- `NavLink` used in: `DashboardLayout.jsx` — applies active class automatically

### Route Parameters
**File:** `frontend/src/App.jsx`
```jsx
<Route path="/dashboard/items/:id" element={<ItemDetailPage />} />
```
**Consumed in:** `frontend/src/pages/ItemDetailPage.jsx`
```js
const { id } = useParams();
```

### Nested Routes
```jsx
<Route element={<ProtectedRoute />}>
  <Route element={<DashboardLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/dashboard/items/lost" element={<ItemsListPage type="lost" />} />
    <Route path="/dashboard/items/found" element={<ItemsListPage type="found" />} />
    <Route path="/dashboard/items/:id" element={<ItemDetailPage />} />
    ...
  </Route>
</Route>
```

### Protected Routes
**File:** `frontend/src/components/ProtectedRoute.jsx`  
Uses `<Outlet />` to render child routes if authenticated, or `<Navigate to="/login" replace />` if not.

### Navigate
**File:** `frontend/src/App.jsx` — `/dashboard/items` redirects to `/dashboard/items/lost`

---

## Context API

### createContext
**File:** `frontend/src/context/AuthContext.jsx`
```js
const AuthContext = createContext(null);
```

### Context Provider
```jsx
<AuthContext.Provider value={{ user, token, loading, loginUser, logout }}>
  {children}
</AuthContext.Provider>
```
**Wrapped in:** `frontend/src/App.jsx` around all routes.

### useContext (via custom hook)
```js
export const useAuth = () => {
  const context = useContext(AuthContext);
  ...
  return context;
};
```
**Used in:**
- `frontend/src/components/ProtectedRoute.jsx` — reads `user` and `loading`
- `frontend/src/layouts/DashboardLayout.jsx` — reads `user`, calls `logout`
- `frontend/src/pages/DashboardPage.jsx` — reads `user` for welcome message
- `frontend/src/pages/LoginPage.jsx` — calls `loginUser()`
- `frontend/src/pages/RegisterPage.jsx` — calls `loginUser()`
- `frontend/src/pages/ProfilePage.jsx` — reads `user`

---

## Axios

### Centralized Axios instance
**File:** `frontend/src/services/api.js`  
**Features:**
- `baseURL: "/api"` (proxied to backend by Vite)
- Request interceptor: injects JWT from `localStorage` as `Authorization: Bearer <token>`
- Response interceptor: unwraps error messages into consistent `Error` objects

### Auth API service functions
**File:** `frontend/src/services/authService.js`  
Functions: `register()`, `login()`, `getMe()`

### Item API service functions
**File:** `frontend/src/services/itemService.js`  
Functions: `getItems()`, `getItemById()`, `reportLostItem()`, `reportFoundItem()`, `updateItem()`, `deleteItem()`

### Usage in components
- All pages call service functions (`authService`, `itemService`) — no raw `fetch()` or direct `axios` calls in component files.

---

## Tailwind CSS

**File:** `frontend/src/index.css`  
**Import:** `@import "tailwindcss";`  
**Config:** `frontend/vite.config.js` uses `@tailwindcss/vite` plugin  
**Used throughout:** Every component and page uses Tailwind utility classes for layout, color, spacing, typography, hover states, and responsive design.

---

## Backend CLO Topics

### Node.js + Express REST API
**File:** `backend/src/server.js`

### async/await
**Files:** `backend/src/controllers/authController.js`, `backend/src/controllers/itemController.js`  
Every controller handler is `async` and uses `await` for all database operations.

### Middleware
**Files:**
- `backend/src/middleware/authMiddleware.js` — JWT authentication middleware
- `backend/src/middleware/errorMiddleware.js` — Centralized error handler
- `backend/src/server.js` — `cors()`, `express.json()`, `express.urlencoded()`

### Environment Variables
**Files:** `backend/.env` (gitignored), `backend/.env.example`  
**Used via:** `dotenv/config` imported in `server.js`

### MongoDB + Mongoose
**File:** `backend/src/config/db.js` — connection  
**Files:** `backend/src/models/User.js`, `backend/src/models/Item.js` — schemas and models

### REST API Structure
**Files:** `backend/src/routes/authRoutes.js`, `backend/src/routes/itemRoutes.js`  
See `docs/API.md` for full endpoint reference.
