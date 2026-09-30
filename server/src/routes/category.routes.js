import { Router } from "express";

import {
  create,
  remove,
  getAll,
  getOne,
  update,
} from "../controllers/category.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validation.middleware.js";

import {
  categoryIdParamsSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator.js";

const router = Router();

/**
 * USER / MODERATOR / ADMIN
 * View all categories
 */
router.get(
  "/",
  getAll,
);

/**
 * USER / MODERATOR / ADMIN
 * View one category
 */
router.get(
  "/:id",
  validate({
    params: categoryIdParamsSchema,
  }),
  getOne,
);

/**
 * ADMIN ONLY
 * Create category
 */
router.post(
  "/",
  authenticate,
  requireAdmin,
  validate({
    body: createCategorySchema,
  }),
  create,
);

/**
 * ADMIN ONLY
 * Update category
 */
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  validate({
    params: categoryIdParamsSchema,
    body: updateCategorySchema,
  }),
  update,
);

/**
 * ADMIN ONLY
 * Delete category
 */
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  validate({
    params: categoryIdParamsSchema,
  }),
  remove,
);

export default router;
