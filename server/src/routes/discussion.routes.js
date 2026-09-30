import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/discussion.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import {
  discussionIdParamsSchema,
  createDiscussionSchema,
  updateDiscussionSchema,
  discussionQuerySchema,
} from "../validators/discussion.validator.js";

const router = Router();

/*
 * GET /discussions
 *
 * Public:
 * Anyone can browse discussions.
 */
router.get(
  "/",
  validate({
    query: discussionQuerySchema,
  }),
  getAll,
);

/*
 * GET /discussions/:id
 *
 * Public:
 * Anyone can view a discussion.
 */
router.get(
  "/:id",
  validate({
    params: discussionIdParamsSchema,
  }),
  getOne,
);

/*
 * POST /discussions
 *
 * Authenticated users:
 * Any logged-in user can create a discussion.
 */
router.post(
  "/",
  authenticate,
  validate({
    body: createDiscussionSchema,
  }),
  create,
);

/*
 * PATCH /discussions/:id
 *
 * Authenticated:
 * - Author can edit own discussion
 * - Moderator can moderate/edit
 * - Admin has full control
 */
router.patch(
  "/:id",
  authenticate,
  validate({
    params: discussionIdParamsSchema,
    body: updateDiscussionSchema,
  }),
  update,
);

/*
 * DELETE /discussions/:id
 *
 * Authenticated:
 * - Author can delete own discussion
 * - Moderator can moderate
 * - Admin has full control
 */
router.delete(
  "/:id",
  authenticate,
  validate({
    params: discussionIdParamsSchema,
  }),
  remove,
);

export default router;
