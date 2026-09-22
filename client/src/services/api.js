/**
 * The one and only Axios instance.
 *
 * Every network call in the application goes through this module - the base URL
 * is never hard-coded anywhere else, and cross-cutting concerns (auth headers,
 * error normalisation, refresh-on-401) are added here once.
 */
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  console.warn(
    "[api] VITE_API_URL is not defined. Copy client/.env.example to client/.env and restart the dev server.",
  );
}

/** Error shape thrown by the interceptors below. */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.cause = cause;
  }
}

const api = axios.create({
  baseURL,
  timeout: 15000,
  // Required later for httpOnly refresh-token cookies.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor.
 * Reserved for attaching credentials once authentication exists.
 */
api.interceptors.request.use((config) => config);

/**
 * Response interceptor.
 * - resolves with the response body, so callers get `{ success, message, data }`
 * - converts any failure into a single `ApiError` shape
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;

    const message =
      payload?.message ??
      (status === 0 ? "Cannot reach the server. Is the backend running?" : error.message);

    return Promise.reject(
      new ApiError(message, {
        status,
        errors: Array.isArray(payload?.errors) ? payload.errors : [],
        cause: error,
      }),
    );
  },
);

export default api;

/** Foundation connectivity check; feature services stay empty until their phases begin. */
export const fetchHealth = () => api.get("/health");
