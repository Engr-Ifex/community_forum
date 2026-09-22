import createError from "http-errors";
import mongoose from "mongoose";
import { ZodError } from "zod";

import { API_MESSAGES, HTTP_STATUS } from "../constants/index.js";
import { errorResponse } from "../utils/apiResponse.js";

const fieldErrors = (issues, source = "body") => issues.map((issue) => ({ source, field: issue.path.join(".") || source, message: issue.message, code: issue.code }));

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) return errorResponse(res, { statusCode: HTTP_STATUS.BAD_REQUEST, message: API_MESSAGES.VALIDATION_FAILED, errors: fieldErrors(error.issues) });
  if (Array.isArray(error.errors) && error.status) return errorResponse(res, { statusCode: error.status, message: error.message, errors: error.errors });
  if (error.type === "entity.parse.failed") return errorResponse(res, { statusCode: HTTP_STATUS.BAD_REQUEST, message: "Invalid JSON payload", errors: [{ source: "body", field: "body", message: "Request body is not valid JSON" }] });
  if (error.type === "entity.too.large") return errorResponse(res, { statusCode: HTTP_STATUS.PAYLOAD_TOO_LARGE, message: "Payload too large" });
  if (error instanceof mongoose.Error.ValidationError) return errorResponse(res, { statusCode: HTTP_STATUS.BAD_REQUEST, message: API_MESSAGES.VALIDATION_FAILED });
  if (error instanceof mongoose.Error.CastError) return errorResponse(res, { statusCode: HTTP_STATUS.BAD_REQUEST, message: `Invalid value for "${error.path}"` });
  if (error.code === 11000) return errorResponse(res, { statusCode: HTTP_STATUS.CONFLICT, message: "Duplicate value" });
  if (createError.isHttpError(error)) return errorResponse(res, { statusCode: error.status, message: error.message });
  return errorResponse(res, { statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR, message: API_MESSAGES.INTERNAL_ERROR });
};

export default errorHandler;
