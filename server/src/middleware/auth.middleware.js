import jwt from "jsonwebtoken";
import createError from "http-errors";

import { env } from "../config/env.js";
import User from "../models/User.js";

const AUTH_COOKIE_NAME = "accessToken";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      return next(
        createError(401, "Authentication required"),
      );
    }

    let payload;

    try {
      payload = jwt.verify(token, env.JWT_SECRET);
    } catch {
      return next(
        createError(401, "Invalid or expired authentication token"),
      );
    }

    if (!payload.sub) {
      return next(
        createError(401, "Invalid authentication token"),
      );
    }

    const user = await User.findById(payload.sub);

    if (!user) {
      return next(
        createError(401, "User no longer exists"),
      );
    }

    if (!user.isActive) {
      return next(
        createError(403, "Your account has been deactivated"),
      );
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

export default authenticate;