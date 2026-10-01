
---

# SECTION 4 — MY PERSONAL CONTRIBUTION (GURROOP SINGH)

---

## `frontend/src/pages/LoginPage.jsx`

**Purpose:** Controlled login form that authenticates the user and stores JWT globally.

**Key code to point to:**
```jsx
const [email, setEmail] = useState("");        // controlled state
const [loading, setLoading] = useState(false); // loading state
const { loginUser } = useAuth();               // Context API consumption

const handleSubmit = async (e) => {
  e.preventDefault();
  const validationError = validate();          // client-side validation
  if (validationError) { setError(validationError); return; }
  setLoading(true);
  try {
    const data = await loginService({ email, password }); // Axios POST /auth/login
    loginUser(data.user, data.token);          // update global AuthContext
    navigate("/dashboard");                    // React Router navigation
  } catch (err) {
    setError(err.message);                     // error from response interceptor
  } finally { setLoading(false); }
};
```

**CLO:** CLO02 (React forms, useState, controlled components, async/await, Context API)  
**Lecture:** 37 (Event Handling, Controlled Components), 44 (Axios, API Integration)

**Likely questions & spoken answers:**

Q: What is a controlled component?  
A: A controlled component is one where the form input's value is controlled entirely by React state. In LoginPage, I have `const [email, setEmail] = useState("")` and the input has `value={email}` and `onChange={(e) => setEmail(e.target.value)}`. So React state is the single source of truth — not the DOM.

Q: Why do you call `e.preventDefault()`?  
A: Because HTML forms by default reload the page on submit. `e.preventDefault()` stops that browser default behaviour so React can handle the submission asynchronously without a page refresh.

Q: What happens after a successful login?  
A: The backend returns a token and user object. I call `loginUser(data.user, data.token)` which saves the token to localStorage and updates the global AuthContext state. Then `navigate("/dashboard")` takes the user to the dashboard via React Router.

Q: How do you handle errors?  
A: The Axios response interceptor in api.js extracts the backend's error message. In the catch block I do `setError(err.message)` which updates state and renders the `<Toast>` component with the error text.

---

## `frontend/src/pages/RegisterPage.jsx`

**Purpose:** Registration form — creates a new user account and auto-logs them in.

**Key differences from LoginPage:** Has an extra `name` field, stronger validation (email regex, password match confirmation), calls `register()` from authService.

**CLO:** CLO02 — same topics as LoginPage plus more complex form validation.

**Q: Why validate on the frontend if the backend also validates?**  
A: Frontend validation gives instant feedback without a network round trip, improving user experience. Backend validation is the real security layer — we never trust the frontend alone. We validate in both places — different purposes.

---

## `frontend/src/context/AuthContext.jsx`

**Purpose:** Global authentication state management using React Context API.

**Key code to point to:**
```jsx
const AuthContext = createContext(null);           // 1. Create context

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(             // read from localStorage on init
    () => localStorage.getItem("vt_token")
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {                               // 2. Verify token on mount
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const data = await getMe();               // calls GET /api/auth/me
        setUser(data.user);
      } catch {
        localStorage.removeItem("vt_token");      // invalid token — clear
        setToken(null); setUser(null);
      } finally { setLoading(false); }
    };
    verifyToken();
  }, []);                                         // [] = run once on mount only

  const loginUser = (userData, jwtToken) => {
    localStorage.setItem("vt_token", jwtToken);   // 3. Save to storage
    setToken(jwtToken); setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("vt_token");           // 4. Clear on logout
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout }}>
      {children}                                  // 5. Provide to all children
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); // 6. Custom hook
```

**CLO:** CLO02 (Context API, useContext, useEffect, localStorage)  
**Lecture:** 43 (Context API, useContext, Global State Management), 39-40 (useEffect)

**Q: Why do you use Context API instead of Redux?**  
A: Context API is built into React and is sufficient for our use case — a simple authentication state shared across components. Redux adds significant boilerplate (actions, reducers, store) which is unnecessary overhead for an application of this scale. The Context API cleanly solves global state sharing without extra dependencies.

**Q: What does the useEffect in AuthContext do?**  
A: When the app first loads, a user might already have a valid token saved in localStorage from a previous session. The useEffect runs once on mount and calls `GET /api/auth/me` with that token. If the backend confirms it's valid, we restore the user session. If it's expired or invalid, we clear localStorage and the user goes to the login page. The `loading` state is kept true during this check so ProtectedRoute shows a spinner instead of flashing the login page.

**Q: Why use localStorage to store the JWT?**  
A: It allows the session to persist across page refreshes and browser restarts. When the page reloads, we read the token from localStorage and verify it against the backend. The alternative — storing in memory (React state only) — would lose the session every time the page refreshes.

**Q: What does `useAuth()` return?**  
A: It returns `{ user, token, loading, loginUser, logout }` — everything a component needs to know about authentication state and perform auth actions.

---

## `frontend/src/services/api.js`

**Purpose:** Central Axios instance with JWT auto-injection and error normalization.

**Key code:**
```js
const api = axios.create({ baseURL: "/api" });    // all calls go to /api/*

// REQUEST INTERCEPTOR — runs before every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("vt_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE INTERCEPTOR — runs on every error response
api.interceptors.response.use(
  (response) => response,                          // pass success through
  (error) => {
    const message = error.response?.data?.message || error.message || "Something went wrong.";
    return Promise.reject(new Error(message));      // normalize error shape
  }
);
```

**CLO:** CLO02 (Axios, API Integration, interceptors)  
**Lecture:** 44 (Axios, API Integration, Loading & Error States)

**Q: Why use an Axios instance instead of plain fetch?**  
A: Three reasons: First, interceptors — I can automatically attach the JWT to every request without writing that logic in every component. Second, the response interceptor normalizes all errors into a consistent shape. Third, the base URL is configured once, so service files just write `/auth/login` not the full URL.

**Q: What does the request interceptor do exactly?**  
A: Before every API call goes out, the interceptor reads `localStorage.getItem("vt_token")`. If a token exists, it adds `Authorization: Bearer <token>` to the request headers. This means the JWT is attached automatically to every call — components and services don't need to manually handle this.

**Q: Why does the response interceptor return `Promise.reject(new Error(message))`?**  
A: The backend always returns errors in `{ success: false, message: "..." }` format. The interceptor extracts that `message` string and wraps it in a standard JavaScript `Error` object. When the catch block in a component runs `catch(err)`, `err.message` is always a clean, human-readable string ready for display in the UI.

---

## `frontend/src/services/authService.js`

**Purpose:** Auth API call abstractions — keeps HTTP logic out of UI components.

```js
export const register = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data;
};
export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
};
export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
```

**Q: Why separate service files from components?**  
A: Separation of concerns. Components handle UI and state. Service files handle API communication. If the API endpoint changes, I update it in one place — the service file — and not in every component that uses it.

---

## `frontend/src/App.jsx`

**Purpose:** Root router configuration — defines all routes and their protection levels.

**Key patterns:**
```jsx
<BrowserRouter>               {/* HTML5 history API routing */}
  <AuthProvider>              {/* Auth context wraps everything */}
    <Routes>
      <Route path="/" element={<LandingPage />} />        {/* public */}
      <Route path="/login" element={<LoginPage />} />     {/* public */}
      <Route element={<ProtectedRoute />}>                {/* auth gate */}
        <Route element={<DashboardLayout />}>             {/* layout wrapper */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/items/lost" element={<ItemsListPage type="lost" />} />
          <Route path="/dashboard/items/:id" element={<ItemDetailPage />} /> {/* route param */}
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />       {/* 404 fallback */}
    </Routes>
  </AuthProvider>
</BrowserRouter>
```

**CLO:** CLO02 (React Router, nested routes, route parameters)  
**Lecture:** 41 (React Router), 42 (Route Parameters, Nested Routes, Layout Components)

**Q: How do nested routes work?**  
A: In React Router v7, when you nest a `<Route>` inside another, the parent renders first and uses `<Outlet />` to render the matched child. So `ProtectedRoute` renders first (checks auth), then `DashboardLayout` renders (shows sidebar), and then the actual page renders inside the layout's `<Outlet />`.

**Q: How does the route parameter work for item detail?**  
A: The path `/dashboard/items/:id` has a dynamic segment `:id`. In `ItemDetailPage`, I call `const { id } = useParams()` to extract whatever value is in that URL position. Then I use that `id` to call `getItemById(id)` to fetch the specific item from the backend.

---

## `frontend/src/components/ProtectedRoute.jsx`

**Purpose:** Guards all dashboard routes — redirects unauthenticated users to /login.

```jsx
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>... spinner ...</div>;  // wait for token verification
  if (!user) return <Navigate to="/login" replace />;  // not logged in
  return <Outlet />;   // logged in — render child route
};
```

**Q: What is `<Outlet />`?**  
A: Outlet is a React Router component that renders the matched child route. When ProtectedRoute is used as a layout route, it wraps child routes. If auth passes, `<Outlet />` tells React Router to render whatever child route was matched (e.g., DashboardPage).

**Q: Why do you check `loading` before `user`?**  
A: On page refresh, the app reads the token from localStorage and calls the backend to verify it. This takes a moment. If I didn't check loading, a logged-in user with a valid token would briefly see the login page before the verification completes. The loading check shows a spinner instead.

---

## `frontend/src/layouts/DashboardLayout.jsx`

**Purpose:** Persistent sidebar navigation and header wrapper for all dashboard pages.

**Key patterns:**
- `useAuth()` to display user name and email in sidebar footer
- `useState` for mobile sidebar toggle (`sidebarOpen`)
- `NavLink` with active class function for highlighted navigation
- `logout()` + `navigate("/login")` on Sign Out button
- `<Outlet />` renders the current dashboard page

**Q: How does the NavLink active styling work?**  
A: NavLink accepts a className function: `className={({ isActive }) => isActive ? "active styles" : "normal styles"}`. React Router automatically sets `isActive` to true when the current URL matches the NavLink's `to` prop.

---

## `backend/src/config/db.js`

**Purpose:** MongoDB connection with automatic in-memory fallback.

**Q: Why does the fallback use dynamic import?**  
A: `mongodb-memory-server` is a heavy dev dependency. Using `await import(...)` instead of a top-level import means it's only loaded if local MongoDB is unavailable. This keeps the production server startup fast when a real MongoDB is connected.

**Q: What does `serverSelectionTimeoutMS: 2000` do?**  
A: It tells Mongoose to give up trying to connect to local MongoDB after 2 seconds. Without this, the default timeout is 30 seconds, which would make startup very slow when MongoDB isn't installed.
