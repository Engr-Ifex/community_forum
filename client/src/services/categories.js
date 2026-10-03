import api from "./api";

// Ask the backend for categories to show in the category dropdown.
export const getCategories = () => api.get("/categories");