import createError from "http-errors";

import User from "../models/User.js";
import Category from "../models/Category.js";
import Discussion from "../models/Discussion.js";
import Report from "../models/Report.js";
import ModerationAction from "../models/ModerationAction.js";

export const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    moderators,
    totalCategories,
    totalDiscussions,
    activeDiscussions,
    lockedDiscussions,
    totalReports,
    pendingReports,
    resolvedReports,
    dismissedReports,
    moderationActions,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      isActive: true,
    }),

    User.countDocuments({
      role: "moderator",
    }),

    Category.countDocuments(),

    Discussion.countDocuments(),

    Discussion.countDocuments({
      status: "active",
    }),

    Discussion.countDocuments({
      status: "locked",
    }),

    Report.countDocuments(),

    Report.countDocuments({
      status: "pending",
    }),

    Report.countDocuments({
      status: "resolved",
    }),

    Report.countDocuments({
      status: "dismissed",
    }),

    ModerationAction.countDocuments(),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      moderators,
    },

    categories: {
      total: totalCategories,
    },

    discussions: {
      total: totalDiscussions,
      active: activeDiscussions,
      locked: lockedDiscussions,
      removed: totalDiscussions - activeDiscussions - lockedDiscussions,
    },

    reports: {
      total: totalReports,
      pending: pendingReports,
      resolved: resolvedReports,
      dismissed: dismissedReports,
    },

    moderation: {
      totalActions: moderationActions,
    },
  };
};

export const getUsers = async () => {
  return User.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
};

export const getUserById = async (userId) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) {
    throw createError(404, "User not found");
  }

  return user;
};

export const updateUser = async ({
  userId,
  role,
  isActive,
  adminId,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError(404, "User not found");
  }

  // Prevent admin from changing their own role
  if (
    user._id.toString() === adminId &&
    role !== undefined &&
    role !== user.role
  ) {
    throw createError(
      400,
      "You cannot change your own admin role",
    );
  }

  // Prevent admin from deactivating themselves
  if (
    user._id.toString() === adminId &&
    isActive === false
  ) {
    throw createError(
      400,
      "You cannot deactivate your own account",
    );
  }

  if (role !== undefined) {
    user.role = role;
  }

  if (isActive !== undefined) {
    user.isActive = isActive;
  }

  await user.save();

  return User.findById(user._id)
    .select("-password")
    .lean();
};

export const deactivateUser = async ({
  userId,
  adminId,
}) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError(404, "User not found");
  }

  if (user._id.toString() === adminId) {
    throw createError(
      400,
      "You cannot deactivate your own account",
    );
  }

  if (!user.isActive) {
    throw createError(
      400,
      "User is already inactive",
    );
  }

  user.isActive = false;

  await user.save();

  return User.findById(user._id)
    .select("-password")
    .lean();
};

export const getDiscussions = async () => {
  return Discussion.find()
    .populate("author", "name email avatar")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();
};

export const getReports = async () => {
  return Report.find()
    .populate("reportedBy", "name email avatar")
    .populate(
      "discussion",
      "title content status author category",
    )
    .populate(
      "reply",
      "content status author discussion",
    )
    .populate("reviewedBy", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();
};

export const getModerationActions = async () => {
  return ModerationAction.find()
    .populate("moderator", "name email role")
    .sort({ createdAt: -1 })
    .lean();
};