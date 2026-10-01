import { Router } from "express";

import {
  dashboard,
  discussions,
  moderationActions,
  reports,
  user,
  users,
  updateUser,
  deactivateUser,
} from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { requireAdmin } from "../middleware/role.middleware.js";

import { validate } from "../middleware/validation.middleware.js";

import {
  adminUserIdParamsSchema,
  updateUserAdminSchema,
} from "../validators/admin.validator.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Admin Dashboard
|--------------------------------------------------------------------------
*/

router.get(
  "/dashboard",
  authenticate,
  requireAdmin,
  dashboard,
);

/*
|--------------------------------------------------------------------------
| User Management
|--------------------------------------------------------------------------
*/

// Get all users
router.get(
  "/users",
  authenticate,
  requireAdmin,
  users,
);

// Get one user
router.get(
  "/users/:id",
  authenticate,
  requireAdmin,
  validate({
    params: adminUserIdParamsSchema,
  }),
  user,
);

// Update user role / active status
router.patch(
  "/users/:id",
  authenticate,
  requireAdmin,
  validate({
    params: adminUserIdParamsSchema,
    body: updateUserAdminSchema,
  }),
  updateUser,
);

// Deactivate user
router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  validate({
    params: adminUserIdParamsSchema,
  }),
  deactivateUser,
);

/*
|--------------------------------------------------------------------------
| Discussion Management
|--------------------------------------------------------------------------
*/

router.get(
  "/discussions",
  authenticate,
  requireAdmin,
  discussions,
);

/*
|--------------------------------------------------------------------------
| Report Management
|--------------------------------------------------------------------------
*/

router.get(
  "/reports",
  authenticate,
  requireAdmin,
  reports,
);

/*
|--------------------------------------------------------------------------
| Moderation History
|--------------------------------------------------------------------------
*/

router.get(
  "/moderation-actions",
  authenticate,
  requireAdmin,
  moderationActions,
);

export default router;