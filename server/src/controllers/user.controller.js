import createError from "http-errors";

import {
  getUserProfile,
  updateUserProfile,
} from "../services/user.service.js";
import { successResponse } from "../utils/apiResponse.js";

// Handles GET /users/:id
export const getUser = async (req, res) => {
  const profile = await getUserProfile(req.params.id);

  return successResponse(res, {
    message: "User profile retrieved successfully",
    data: profile,
  });
};

// Handles PATCH /users/:id
export const patchUser = async (req, res) => {
  // Stop someone from editing another user's profile.
  if (req.params.id !== req.user.id) {
    throw createError(403, "You can only update your own profile");
  }

  const user = await updateUserProfile(req.params.id, req.body);

  return successResponse(res, {
    message: "User profile updated successfully",
    data: { user },
  });
};