import api from "./api.js";

/**
 * Authentication service functions.
 * Components call these instead of making direct Axios calls,
 * keeping API logic out of UI components.
 */

/** Register a new user account */
export const register = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data; // { success, token, user }
};

/** Login with email and password */
export const login = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data; // { success, token, user }
};

/** Fetch the currently authenticated user's profile */
export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data; // { success, user }
};
