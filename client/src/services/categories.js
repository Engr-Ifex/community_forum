import api from "./api";

// Read: public. Write: admin only.
export const getCategories = () => api.get("/categories");

export const getCategory = (categoryId) => api.get(`/categories/${categoryId}`);

export const createCategory = (payload) => api.post("/categories", payload);

export const updateCategory = (categoryId, updates) =>
  api.patch(`/categories/${categoryId}`, updates);

export const deleteCategory = (categoryId) =>
  api.delete(`/categories/${categoryId}`);
