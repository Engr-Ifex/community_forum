import createError from "http-errors";

import { API_MESSAGES, HTTP_STATUS } from "../constants/index.js";

export const notFound = (req, res, next) => next(createError(HTTP_STATUS.NOT_FOUND, API_MESSAGES.ROUTE_NOT_FOUND));

export default notFound;
