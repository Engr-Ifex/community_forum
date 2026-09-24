import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  authorize,
  requireAdmin,
  requireModerator,
} from "../middleware/role.middleware.js";

const router = Router();

/**
 * Any authenticated user.
 */
router.get("/user", authenticate, authorize("user", "moderator", "admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "User-level access granted",
    data: {
      userId: req.user.id,
      role: req.user.role,
    },
  });
});

/**
 * Moderator + Admin.
 */
router.get("/moderator", authenticate, requireModerator, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Moderator-level access granted",
    data: {
      userId: req.user.id,
      role: req.user.role,
    },
  });
});

/**
 * Admin only.
 */
router.get("/admin", authenticate, requireAdmin, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin-level access granted",
    data: {
      userId: req.user.id,
      role: req.user.role,
    },
  });
});

export default router;