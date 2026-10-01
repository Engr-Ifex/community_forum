import {
  deactivateUser as deactivateUserService,
  getDashboardStats,
  getDiscussions as getDiscussionsService,
  getModerationActions,
  getReports as getReportsService,
  getUserById,
  getUsers,
  updateUser as updateUserService,
} from "../services/admin.service.js";

import { successResponse } from "../utils/apiResponse.js";

export const dashboard = async (req, res) => {
  const stats = await getDashboardStats();

  return successResponse(res, {
    message: "Admin dashboard retrieved successfully",
    data: {
      dashboard: stats,
    },
  });
};

export const users = async (req, res) => {
  const users = await getUsers();

  return successResponse(res, {
    message: "Users retrieved successfully",
    data: {
      users,
    },
  });
};

export const user = async (req, res) => {
  const foundUser = await getUserById(req.params.id);

  return successResponse(res, {
    message: "User retrieved successfully",
    data: {
      user: foundUser,
    },
  });
};

export const updateUser = async (req, res) => {
  const updatedUser = await updateUserService({
    userId: req.params.id,
    role: req.body.role,
    isActive: req.body.isActive,
    adminId: req.user.id,
  });

  return successResponse(res, {
    message: "User updated successfully",
    data: {
      user: updatedUser,
    },
  });
};

export const deactivateUser = async (req, res) => {
  const deactivatedUser = await deactivateUserService({
    userId: req.params.id,
    adminId: req.user.id,
  });

  return successResponse(res, {
    message: "User deactivated successfully",
    data: {
      user: deactivatedUser,
    },
  });
};

export const discussions = async (req, res) => {
  const discussions = await getDiscussionsService();

  return successResponse(res, {
    message: "Discussions retrieved successfully",
    data: {
      discussions,
    },
  });
};

export const reports = async (req, res) => {
  const reports = await getReportsService();

  return successResponse(res, {
    message: "Reports retrieved successfully",
    data: {
      reports,
    },
  });
};

export const moderationActions = async (req, res) => {
  const actions = await getModerationActions();

  return successResponse(res, {
    message: "Moderation actions retrieved successfully",
    data: {
      actions,
    },
  });
};