import bcrypt from "bcryptjs";
import createError from "http-errors";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };

  delete userObject.password;

  return userObject;
};

export const registerUser = async ({
  name,
  email,
  password,
  avatar,
  bio,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar,
    bio,
  });

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw createError(403, "Your account has been deactivated");
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw createError(401, "Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    user: sanitizeUser(user),
    token,
  };
};

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw createError(404, "User not found");
  }

  if (!user.isActive) {
    throw createError(403, "Your account has been deactivated");
  }

  return sanitizeUser(user);
};