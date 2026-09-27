import createError from "http-errors";

import Discussion from "../models/Discussion.js";
import Reply from "../models/Reply.js";
import User from "../models/User.js";

// These are the user fields the API can show.
// The password is deliberately not included.
const publicUserFields = "name email avatar bio createdAt";

// Gets one user's profile, discussions, and replies.
export const getUserProfile = async (userId) => {
  const user = await User.findOne({ _id: userId, isActive: true })
    .select(publicUserFields)
    .lean();

  if (!user) {
    throw createError(404, "User not found");
  }

  const [discussions, replies] = await Promise.all([
    Discussion.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean(),

    Reply.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return { user, discussions, replies };
};

// Updates the fields sent in the request.
export const updateUserProfile = async (userId, updates) => {
  const user = await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  )
    .select(publicUserFields)
    .lean();

  if (!user) {
    throw createError(404, "User not found");
  }

  return user;
};