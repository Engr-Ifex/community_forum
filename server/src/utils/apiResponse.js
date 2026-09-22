import { HTTP_STATUS } from "../constants/index.js";

export const successResponse = (res, { statusCode = HTTP_STATUS.OK, message = "Request successful", data } = {}) => {
  const body = { success: true, message };
  if (data !== undefined) body.data = data;
  return res.status(statusCode).json(body);
};

export const errorResponse = (res, { statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, message = "Something went wrong", errors } = {}) => {
  const body = { success: false, message };
  if (Array.isArray(errors) && errors.length) body.errors = errors;
  return res.status(statusCode).json(body);
};

export const createdResponse = (res, options = {}) => successResponse(res, { ...options, statusCode: HTTP_STATUS.CREATED });
