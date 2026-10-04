import api from "./api";

/*
 * Authentication endpoints.
 *
 * These follow the project's shared Axios instance, whose response interceptor
 * resolves with `response.data` - i.e. the backend body `{ success, message, data }`.
 * The JWT itself is set as an httpOnly cookie by the server; nothing here reads
 * or stores the token.
 *
 * Success bodies:
 *   register -> { success, message, data: { user } }   (201 + accessToken cookie)
 *   login    -> { success, message, data: { user } }   (200 + accessToken cookie)
 *   logout   -> { success, message }                   (200, cookie cleared)
 *   me       -> { success, message, data: { user } }   (200, or 401 when signed out)
 */

export const register = (details) => api.post("/auth/register", details);

export const login = (credentials) => api.post("/auth/login", credentials);

export const logout = () => api.post("/auth/logout");

/**
 * Resolve the current session from the httpOnly cookie.
 * Rejects with an ApiError(401) when there is no valid session.
 */
export const getCurrentUser = () => api.get("/auth/me");

/**
 * Pull `{ field: message }` out of an ApiError's `errors` array.
 *
 * The backend's validation middleware emits
 *   errors: [{ source, field, message, code }]
 * where `field` is the dotted path into the request body (e.g. "email").
 * Returns an empty object for any non-validation failure.
 */
export const getFieldErrors = (error) => {
  const list = Array.isArray(error?.errors) ? error.errors : [];

  return list.reduce((accumulator, entry) => {
    if (entry?.field && entry?.message && !accumulator[entry.field]) {
      accumulator[entry.field] = entry.message;
    }

    return accumulator;
  }, {});
};
