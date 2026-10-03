import createError from "http-errors";

/**
 * Restrict access to specific roles.
 *
 * Usage:
 * authorize("admin")
 * authorize("moderator", "admin")
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createError(403, "You do not have permission to access this resource"),
      );
    }

    next();
  };
};

/**
 * Allow moderators and admins.
 */
export const requireModerator = authorize("moderator", "admin");

/**
 * Allow admins only.
 */
export const requireAdmin = authorize("admin");

export default authorize;
