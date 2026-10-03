import createError from "http-errors";

import Discussion from "../models/Discussion.js";
import Reply from "../models/Reply.js";
import Report from "../models/Report.js";
import ModerationAction from "../models/ModerationAction.js";

const createModerationAction = async ({
  moderator,
  action,
  target,
  reason = "",
}) => {
  return ModerationAction.create({
    moderator,
    action,
    target,
    reason: reason.trim(),
  });
};

export const removeDiscussion = async ({
  discussionId,
  moderatorId,
  reason = "",
}) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  if (discussion.status === "removed") {
    throw createError(400, "Discussion has already been removed");
  }

  discussion.status = "removed";

  await discussion.save();

  const moderationAction = await createModerationAction({
    moderator: moderatorId,
    action: "remove_discussion",
    target: discussion._id,
    reason,
  });

  return {
    discussion,
    moderationAction,
  };
};

export const removeReply = async ({
  replyId,
  moderatorId,
  reason = "",
}) => {
  const reply = await Reply.findById(replyId);

  if (!reply) {
    throw createError(404, "Reply not found");
  }

  if (reply.status === "removed") {
    throw createError(400, "Reply has already been removed");
  }

  reply.status = "removed";

  await reply.save();

  const moderationAction = await createModerationAction({
    moderator: moderatorId,
    action: "remove_reply",
    target: reply._id,
    reason,
  });

  return {
    reply,
    moderationAction,
  };
};

export const lockDiscussion = async ({
  discussionId,
  moderatorId,
  reason = "",
}) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  if (discussion.status === "removed") {
    throw createError(
      400,
      "A removed discussion cannot be locked",
    );
  }

  if (discussion.status === "locked") {
    throw createError(400, "Discussion is already locked");
  }

  discussion.status = "locked";

  await discussion.save();

  const moderationAction = await createModerationAction({
    moderator: moderatorId,
    action: "lock_discussion",
    target: discussion._id,
    reason,
  });

  return {
    discussion,
    moderationAction,
  };
};

export const dismissReport = async ({
  reportId,
  moderatorId,
  reason = "",
}) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw createError(404, "Report not found");
  }

  if (report.status !== "pending") {
    throw createError(
      400,
      "Only pending reports can be dismissed",
    );
  }

  report.status = "dismissed";
  report.reviewedBy = moderatorId;

  await report.save();

  const moderationAction = await createModerationAction({
    moderator: moderatorId,
    action: "dismiss_report",
    target: report._id,
    reason,
  });

  return {
    report,
    moderationAction,
  };
};

export const resolveReport = async ({
  reportId,
  moderatorId,
  reason = "",
}) => {
  const report = await Report.findById(reportId);

  if (!report) {
    throw createError(404, "Report not found");
  }

  if (report.status !== "pending") {
    throw createError(
      400,
      "Only pending reports can be resolved",
    );
  }

  report.status = "resolved";
  report.reviewedBy = moderatorId;

  await report.save();

  const moderationAction = await createModerationAction({
    moderator: moderatorId,
    action: "resolve_report",
    target: report._id,
    reason,
  });

  return {
    report,
    moderationAction,
  };
};