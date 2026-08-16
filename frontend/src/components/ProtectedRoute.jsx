import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * ProtectedRoute — wraps dashboard routes.
 * If the user is not authenticated, redirects to /login.
 * While the auth state is loading (verifying stored token), shows a
 * full-page spinner so we never flash the login page for logged-in users.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  // Not logged in → redirect to login, preserving the intended destination
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Render the nested dashboard route
  return <Outlet />;
};

export default ProtectedRoute;
