import { Router } from "express";

import {
  dismissReport,
  lockDiscussion,
  removeDiscussion,
  removeReply,
  resolveReport,
} from "../controllers/moderation.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireModerator } from "../middleware/role.middleware.js";

import { validate } from "../middleware/validation.middleware.js";

import {
  moderationIdParamsSchema,
  moderationReasonSchema,
} from "../validators/moderation.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Report Moderation
|--------------------------------------------------------------------------
*/

// Dismiss a report
router.patch(
  "/reports/:id/dismiss",
  authenticate,
  requireModerator,
  validate({
    params: moderationIdParamsSchema,
    body: moderationReasonSchema,
  }),
  dismissReport,
);

// Resolve a report
router.patch(
  "/reports/:id/resolve",
  authenticate,
  requireModerator,
  validate({
    params: moderationIdParamsSchema,
    body: moderationReasonSchema,
  }),
  resolveReport,
);

/*
|--------------------------------------------------------------------------
| Discussion Moderation
|--------------------------------------------------------------------------
*/

// Lock a discussion
router.patch(
  "/discussions/:id/lock",
  authenticate,
  requireModerator,
  validate({
    params: moderationIdParamsSchema,
    body: moderationReasonSchema,
  }),
  lockDiscussion,
);

// Remove a discussion
router.delete(
  "/discussions/:id",
  authenticate,
  requireModerator,
  validate({
    params: moderationIdParamsSchema,
    body: moderationReasonSchema,
  }),
  removeDiscussion,
);

/*
|--------------------------------------------------------------------------
| Reply Moderation
|--------------------------------------------------------------------------
*/

// Remove a reply
router.delete(
  "/replies/:id",
  authenticate,
  requireModerator,
  validate({
    params: moderationIdParamsSchema,
    body: moderationReasonSchema,
  }),
  removeReply,
);

export default router;
