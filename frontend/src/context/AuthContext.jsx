import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../services/authService.js";

/**
 * AuthContext — global authentication state.
 *
 * Provides:
 *   - user        : the logged-in user object (or null)
 *   - token       : JWT string (or null)
 *   - loading     : true while verifying token on mount
 *   - loginUser() : save token + user, persist to localStorage
 *   - logout()    : clear token + user
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("vt_token"));
  const [loading, setLoading] = useState(true); // loading = verifying stored token

  // On mount: if a token exists in localStorage, verify it against the backend
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        // Token is invalid/expired — clear it
        localStorage.removeItem("vt_token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []); // Run only on mount

  /** Call this after a successful login or register API response */
  const loginUser = (userData, jwtToken) => {
    localStorage.setItem("vt_token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  /** Clear auth state everywhere */
  const logout = () => {
    localStorage.removeItem("vt_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Usage: const { user, loginUser, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return context;
};

export default AuthContext;
