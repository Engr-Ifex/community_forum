/**
 * Global API rate limiter.
 *
 * Defaults are intentionally loose (2000 requests / 15 min outside production)
 * so that normal local development and automated tests are never throttled,
 * while production defaults to 300 / 15 min. Both are tunable through
 * RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX.
 */
import rateLimit from "express-rate-limit";

import { env } from "../config/env.js";
import { API_MESSAGES, HTTP_STATUS } from "../constants/index.js";
import { errorResponse } from "../utils/apiResponse.js";

export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  // Never throttle the test suite.
  skip: () => env.isTest,
  handler: (req, res) =>
    errorResponse(res, {
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
      message: API_MESSAGES.TOO_MANY_REQUESTS,
    }),
});

export default apiLimiter;
