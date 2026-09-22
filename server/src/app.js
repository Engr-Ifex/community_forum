/**
 * Express application wiring only - no business logic, no server startup.
 *
 * Splitting `app.js` (configuration) from `server.js` (process lifecycle) lets
 * tests import the app and drive it with an ephemeral listener, and keeps the
 * middleware order in one readable place.
 */
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import apiRoutes from "./routes/index.routes.js";

const app = express();

// Behind a reverse proxy in production, required for correct client IPs (rate limiting).
if (env.isProduction) {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

// 1. Body parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// 2. Security headers
app.use(helmet());

// 3. CORS - restricted to the configured frontend origin(s).
app.use(
  cors({
    origin: env.CLIENT_ORIGINS,
    credentials: true,
  }),
);

// 4. Cookies - required by the authentication phase, configured now.
app.use(cookieParser());

// 5. Request logging
if (!env.isTest) {
  app.use(morgan(env.isProduction ? "combined" : "dev"));
}

// 6. Rate limiting (API only)
app.use(env.API_PREFIX, apiLimiter);

// 7. Routes
app.use(env.API_PREFIX, apiRoutes);

// 8. Unmatched routes -> 9. global error handler (always last)
app.use(notFound);
app.use(errorHandler);

export default app;
