import { Router } from "express";

import { API_MESSAGES } from "../constants/index.js";
import { successResponse } from "../utils/apiResponse.js";
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

router.get("/health", (req, res) =>
  successResponse(res, {
    message: API_MESSAGES.HEALTH_OK,
  }),
);

router.use("/auth", authRoutes);
router.use("/authorization", authorizationRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/discussions", discussionRoutes);
router.use("/", replyRoutes);
router.use("/reports", reportRoutes);
router.use("/moderation", moderationRoutes);
router.use("/admin", adminRoutes);
export default router;