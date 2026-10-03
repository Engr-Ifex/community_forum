import { Router } from "express";

import {
  create,
  getAll,
  getOne,
} from "../controllers/report.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  requireModerator,
} from "../middleware/role.middleware.js";

import { validate } from "../middleware/validation.middleware.js";

import {
  createReportSchema,
  reportIdParamsSchema,
} from "../validators/report.validator.js";

const router = Router();

/**
 * User:
 * Report a discussion or reply
 */
router.post(
  "/",
  authenticate,
  validate({
    body: createReportSchema,
  }),
  create,
);

/**
 * Moderator/Admin:
 * View all reports
 */
router.get(
  "/",
  authenticate,
  requireModerator,
  getAll,
);

/**
 * Moderator/Admin:
 * View one report and the reported content
 */
router.get(
  "/:id",
  authenticate,
  requireModerator,
  validate({
    params: reportIdParamsSchema,
  }),
  getOne,
);

export default router;
