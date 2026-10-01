import api from "./api.js";

/**
 * Item service functions.
 * All item-related API calls go through here.
 */

/** Fetch all items with optional filters, pagination, and sorting
 *  Supported params: type, category, status, search, page, limit, sort
 */
export const getItems = async (filters = {}) => {
  const { data } = await api.get("/items", { params: filters });
  return data; // { success, count, total, page, pages, items }
};

/**
 * Fetch items reported by the currently authenticated user.
 * Calls GET /api/items/my — dedicated backend route (no client-side filtering).
 * Supported params: type, status, page, limit, sort
 */
export const getMyItems = async (filters = {}) => {
  const { data } = await api.get("/items/my", { params: filters });
  return data; // { success, count, total, page, pages, items }
};

/** Fetch a single item by its MongoDB id */
export const getItemById = async (id) => {
  const { data } = await api.get(`/items/${id}`);
  return data; // { success, item }
};

/** Report a lost item */
export const reportLostItem = async (payload) => {
  const { data } = await api.post("/items/lost", payload);
  return data; // { success, item }
};

/** Report a found item */
export const reportFoundItem = async (payload) => {
  const { data } = await api.post("/items/found", payload);
  return data; // { success, item }
};

/** Update an existing item */
export const updateItem = async (id, payload) => {
  const { data } = await api.put(`/items/${id}`, payload);
  return data; // { success, item }
};

/** Delete an item */
export const deleteItem = async (id) => {
  const { data } = await api.delete(`/items/${id}`);
  return data; // { success, message }
};
