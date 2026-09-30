import createError from "http-errors";

import Report from "../models/Report.js";
import Discussion from "../models/Discussion.js";
import Reply from "../models/Reply.js";

export const createReport = async ({
  reportedBy,
  discussion,
  reply,
  reason,
}) => {
  // Report a discussion
  if (discussion) {
    const discussionExists = await Discussion.findById(discussion);

    if (!discussionExists || discussionExists.status === "removed") {
      throw createError(404, "Discussion not found");
    }
  }

  // Report a reply
  if (reply) {
    const replyExists = await Reply.findById(reply);

    if (!replyExists || replyExists.status === "removed") {
      throw createError(404, "Reply not found");
    }
  }

  // Prevent duplicate pending reports from the same user
  const existingReport = await Report.findOne({
    reportedBy,
    ...(discussion ? { discussion } : { reply }),
    status: "pending",
  });

  if (existingReport) {
    throw createError(
      409,
      "You have already reported this content",
    );
  }

  const report = await Report.create({
    reportedBy,
    discussion: discussion || null,
    reply: reply || null,
    reason: reason.trim(),
  });

  return Report.findById(report._id)
    .populate("reportedBy", "name email avatar")
    .populate("discussion", "title content status author category")
    .populate("reply", "content status author discussion")
    .lean();
};

export const getReports = async () => {
  return Report.find()
    .populate("reportedBy", "name email avatar")
    .populate("discussion", "title content status author category")
    .populate("reply", "content status author discussion")
    .populate("reviewedBy", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();
};

export const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("reportedBy", "name email avatar")
    .populate("discussion", "title content status author category")
    .populate("reply", "content status author discussion")
    .populate("reviewedBy", "name email avatar")
    .lean();

  if (!report) {
    throw createError(404, "Report not found");
  }

  return report;
};