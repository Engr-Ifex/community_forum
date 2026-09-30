import { Router } from "express";

import {
  create,
  getAll,
  remove,
  update,
} from "../controllers/reply.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import {
  discussionIdParamsSchema,
  replyIdParamsSchema,
  createReplySchema,
  updateReplySchema,
} from "../validators/reply.validator.js";

const router = Router();

/*
 * GET /discussions/:id/replies
 *
 * Read replies belonging to a discussion.
 */
router.get(
  "/discussions/:id/replies",
  validate({
    params: discussionIdParamsSchema,
  }),
  getAll,
);

/*
 * POST /discussions/:id/replies
 *
 * Create a reply.
 */
router.post(
  "/discussions/:id/replies",
  authenticate,
  validate({
    params: discussionIdParamsSchema,
    body: createReplySchema,
  }),
  create,
);

/*
 * PATCH /replies/:id
 *
 * Edit own reply.
 */
router.patch(
  "/replies/:id",
  authenticate,
  validate({
    params: replyIdParamsSchema,
    body: updateReplySchema,
  }),
  update,
);

/*
 * DELETE /replies/:id
 *
 * Delete own reply.
 */
router.delete(
  "/replies/:id",
  authenticate,
  validate({
    params: replyIdParamsSchema,
  }),
  remove,
);

export default router;