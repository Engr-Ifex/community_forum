/**
 * Shared, feature-agnostic constants.
 * Feature specific constants belong inside their own feature folder.
 */

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
});

/** Response messages reused across middleware and routes. */
export const API_MESSAGES = Object.freeze({
  API_ROOT: "Community Forum API",
  HEALTH_OK: "Community Forum API is running",
  ROUTE_NOT_FOUND: "Route not found",
  VALIDATION_FAILED: "Validation failed",
  TOO_MANY_REQUESTS: "Too many requests, please try again later",
  INTERNAL_ERROR: "Something went wrong",
});

export const REQUEST_TARGETS = Object.freeze(["body", "params", "query"]);
