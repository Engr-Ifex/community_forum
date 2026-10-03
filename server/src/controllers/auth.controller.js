import { env } from "../config/env.js";
import {
  createdResponse,
  successResponse,
} from "../utils/apiResponse.js";
import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/auth.service.js";

const AUTH_COOKIE_NAME = "accessToken";

const cookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);
};

const clearAuthCookie = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? "none" : "lax",
    path: "/",
  });
};

export const register = async (req, res) => {
  const { user, token } = await registerUser(req.body);

  setAuthCookie(res, token);

  return createdResponse(res, {
    message: "Account created successfully",
    data: { user },
  });
};

export const login = async (req, res) => {
  const { user, token } = await loginUser(req.body);

  setAuthCookie(res, token);

  return successResponse(res, {
    message: "Login successful",
    data: { user },
  });
};

export const logout = async (req, res) => {
  clearAuthCookie(res);

  return successResponse(res, {
    message: "Logout successful",
  });
};

export const getMe = async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return successResponse(res, {
    message: "Current user retrieved successfully",
    data: { user },
  });
};