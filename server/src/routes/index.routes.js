import { Router } from "express";

import { API_MESSAGES, HTTP_STATUS } from "../constants/index.js";
import { getDatabaseState } from "../config/database.js";
import { env } from "../config/env.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import authorizationRoutes from "./authorization.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import discussionRoutes from "./discussion.routes.js";
import replyRoutes from "./reply.routes.js";
import reportRoutes from "./report.routes.js";
import moderationRoutes from "./moderation.routes.js";
import adminRoutes from "./admin.routes.js";

const router = Router();

router.get("/", (req, res) =>
  successResponse(res, {
    message: API_MESSAGES.API_ROOT,
  }),
);

/**
 * Liveness probe - is the process up and serving?
 * Deliberately does NOT touch the database, so a platform liveness check does
 * not kill a healthy process during a transient DB blip.
 */
router.get("/health", (req, res) =>
  successResponse(res, {
    message: API_MESSAGES.HEALTH_OK,
  }),
);

/**
 * Readiness probe - can this instance actually serve traffic?
 * Reports 503 when MongoDB is not connected, so a load balancer stops routing
 * here instead of sending requests that will all fail.
 */
router.get("/ready", (req, res) => {
  // readyState 1 === mongoose.connection.readyState.connected
  const isConnected = getDatabaseState() === 1;

  if (!isConnected) {
    return errorResponse(res, {
      statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
      message: API_MESSAGES.HEALTH_DEGRADED,
    });
  }

  return successResponse(res, {
    message: API_MESSAGES.HEALTH_OK,
    data: { database: "connected" },
  });
});

router.use("/auth", authRoutes);
// Development-only role probes. They exist to exercise the auth/role middleware
// in isolation; nothing in the client calls them and they are not mounted in
// production.
if (!env.isProduction) {
  router.use("/authorization", authorizationRoutes);
}
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/discussions", discussionRoutes);
router.use("/", replyRoutes);
router.use("/reports", reportRoutes);
router.use("/moderation", moderationRoutes);
router.use("/admin", adminRoutes);
export default router;