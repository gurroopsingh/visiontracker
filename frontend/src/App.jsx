import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";

// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

// Dashboard pages
import DashboardPage from "./pages/DashboardPage.jsx";
import ItemsListPage from "./pages/ItemsListPage.jsx";
import ItemDetailPage from "./pages/ItemDetailPage.jsx";
import ReportLostPage from "./pages/ReportLostPage.jsx";
import ReportFoundPage from "./pages/ReportFoundPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import EditItemPage from "./pages/EditItemPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

/**
 * App.jsx — Root router configuration.
 *
 * Route structure:
 *   /               Landing page (public)
 *   /login          Login (public)
 *   /register       Register (public)
 *   /dashboard/*    Protected — requires auth via ProtectedRoute
 *     /dashboard              Dashboard overview
 *     /dashboard/items/lost   Lost items feed    (nested route)
 *     /dashboard/items/found  Found items feed   (nested route)
 *     /dashboard/items/:id    Item detail        (route param)
 *     /dashboard/report-lost  Report lost form
 *     /dashboard/report-found Report found form
 *     /dashboard/profile      User profile
 *   *               404 fallback
 */
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Routes>
        {/* ── Public Routes ──────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected Dashboard Routes ─────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Nested item routes under /dashboard/items */}
            <Route path="/dashboard/items/lost" element={<ItemsListPage type="lost" />} />
            <Route path="/dashboard/items/found" element={<ItemsListPage type="found" />} />
            <Route path="/dashboard/items/:id" element={<ItemDetailPage />} />

            <Route path="/dashboard/report-lost" element={<ReportLostPage />} />
            <Route path="/dashboard/report-found" element={<ReportFoundPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
            <Route path="/dashboard/items/:id/edit" element={<EditItemPage />} />

            {/* Redirect bare /dashboard/items to lost feed */}
            <Route
              path="/dashboard/items"
              element={<Navigate to="/dashboard/items/lost" replace />}
            />
          </Route>
        </Route>

        {/* ── 404 Fallback ───────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
