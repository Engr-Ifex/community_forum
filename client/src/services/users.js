import api from "./api";

/*
 * User endpoints.
 *
 * GET /users/:id is public; PATCH /users/:id is authenticated and the backend
 * only allows a user to edit their own profile.
 */

export const getUser = (userId) => api.get(`/users/${userId}`);

// body may contain any of: { name, bio, avatar } - avatar accepts null to clear.
export const updateUser = (userId, updates) =>
  api.patch(`/users/${userId}`, updates);
