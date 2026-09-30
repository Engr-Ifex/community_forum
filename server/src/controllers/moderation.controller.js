import {
  dismissReport as dismissReportService,
  lockDiscussion as lockDiscussionService,
  removeDiscussion as removeDiscussionService,
  removeReply as removeReplyService,
  resolveReport as resolveReportService,
} from "../services/moderation.service.js";

import { successResponse } from "../utils/apiResponse.js";

export const removeDiscussion = async (req, res) => {
  const result = await removeDiscussionService({
    discussionId: req.params.id,
    moderatorId: req.user.id,
    reason: req.body.reason,
  });

  return successResponse(res, {
    message: "Discussion removed successfully",
    data: result,
  });
};

export const removeReply = async (req, res) => {
  const result = await removeReplyService({
    replyId: req.params.id,
    moderatorId: req.user.id,
    reason: req.body.reason,
  });

  return successResponse(res, {
    message: "Reply removed successfully",
    data: result,
  });
};

export const lockDiscussion = async (req, res) => {
  const result = await lockDiscussionService({
    discussionId: req.params.id,
    moderatorId: req.user.id,
    reason: req.body.reason,
  });

  return successResponse(res, {
    message: "Discussion locked successfully",
    data: result,
  });
};

export const dismissReport = async (req, res) => {
  const result = await dismissReportService({
    reportId: req.params.id,
    moderatorId: req.user.id,
    reason: req.body.reason,
  });

  return successResponse(res, {
    message: "Report dismissed successfully",
    data: result,
  });
};

export const resolveReport = async (req, res) => {
  const result = await resolveReportService({
    reportId: req.params.id,
    moderatorId: req.user.id,
    reason: req.body.reason,
  });

  return successResponse(res, {
    message: "Report resolved successfully",
    data: result,
  });
};