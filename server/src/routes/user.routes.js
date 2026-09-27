import { Router } from "express";

import {
  getUser,
  patchUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import {
  updateUserSchema,
  userIdParamsSchema,
} from "../validators/user.validator.js";

const router = Router();

// GET /users/:id
router.get(
  "/:id",
  validate({ params: userIdParamsSchema }),
  getUser,
);

// PATCH /users/:id
router.patch(
  "/:id",
  authenticate,
  validate({
    params: userIdParamsSchema,
    body: updateUserSchema,
  }),
  patchUser,
);

export default router;