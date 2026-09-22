import createError from "http-errors";
import { z } from "zod";

import { API_MESSAGES, HTTP_STATUS } from "../constants/index.js";

const isSchema = (value) => value instanceof z.ZodType || typeof value?.safeParse === "function";
const formatIssues = (error, source) => error.issues.map((issue) => ({ source, field: issue.path.join(".") || source, message: issue.message, code: issue.code }));

const setRequestValue = (req, key, value) => Object.defineProperty(req, key, { value, writable: true, enumerable: true, configurable: true });

export const validate = (schemas) => {
  const normalized = isSchema(schemas) ? { body: schemas } : schemas;

  if (!normalized || typeof normalized !== "object" || !Object.keys(normalized).length) throw new TypeError("validate() expects a Zod schema, or an object with body/params/query Zod schemas");

  for (const [target, schema] of Object.entries(normalized)) {
    if (!["body", "params", "query"].includes(target) || !isSchema(schema)) throw new TypeError(`validate(): "${target}" must be a Zod schema`);
  }

  return (req, res, next) => {
    const errors = [];
    for (const [target, schema] of Object.entries(normalized)) {
      const result = schema.safeParse(req[target] ?? {});
      if (result.success) setRequestValue(req, target, result.data);
      else errors.push(...formatIssues(result.error, target));
    }
    if (errors.length) {
      const error = createError(HTTP_STATUS.BAD_REQUEST, API_MESSAGES.VALIDATION_FAILED);
      error.errors = errors;
      return next(error);
    }
    return next();
  };
};

export default validate;
