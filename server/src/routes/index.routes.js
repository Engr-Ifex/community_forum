import { Router } from "express";

import { API_MESSAGES } from "../constants/index.js";
import { successResponse } from "../utils/apiResponse.js";
import authorizationRoutes from "./authorization.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import discussionRoutes from "./discussion.routes.js";

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
export default router;