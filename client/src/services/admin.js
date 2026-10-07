import api from "./api";

/*
 * Admin-only endpoints. The backend protects every one of these with
 * authenticate + requireAdmin, so a 403 here means the caller is not an admin.
 */

export const getDashboard = () => api.get("/admin/dashboard");

export const getUsers = () => api.get("/admin/users");

export const getUser = (userId) => api.get(`/admin/users/${userId}`);

export const updateUser = (userId, updates) =>
  api.patch(`/admin/users/${userId}`, updates);

export const deactivateUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getDiscussions = () => api.get("/admin/discussions");

export const getReports = () => api.get("/admin/reports");

export const getModerationActions = () => api.get("/admin/moderation-actions");
