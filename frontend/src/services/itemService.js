import api from "./api.js";

/**
 * Item service functions.
 * All item-related API calls go through here.
 */

/** Fetch all items with optional filters */
export const getItems = async (filters = {}) => {
  const { data } = await api.get("/items", { params: filters });
  return data; // { success, count, items }
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
