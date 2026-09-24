import { Router } from "express";

import { API_MESSAGES } from "../constants/index.js";
import { successResponse } from "../utils/apiResponse.js";
import authRoutes from "./auth.routes.js";

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

export default router;