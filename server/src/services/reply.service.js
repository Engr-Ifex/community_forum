import createError from "http-errors";

import Reply from "../models/Reply.js";
import Discussion from "../models/Discussion.js";

export const createReply = async ({
  content,
  discussionId,
  authorId,
}) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  if (discussion.status === "removed") {
    throw createError(
      404,
      "You cannot reply to a removed discussion",
    );
  }

  if (discussion.status === "locked") {
    throw createError(
      403,
      "This discussion is locked and no longer accepts replies",
    );
  }

  const reply = await Reply.create({
    content: content.trim(),
    discussion: discussionId,
    author: authorId,
  });

  return Reply.findById(reply._id)
    .populate("author", "name avatar")
    .lean();
};

export const getRepliesByDiscussion = async (discussionId) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion || discussion.status === "removed") {
    throw createError(404, "Discussion not found");
  }

  return Reply.find({
    discussion: discussionId,
    status: "active",
  })
    .populate("author", "name avatar")
    .sort({ createdAt: 1 })
    .lean();
};

export const updateReply = async (
  replyId,
  content,
  userId,
) => {
  const reply = await Reply.findById(replyId);

  if (!reply || reply.status === "removed") {
    throw createError(404, "Reply not found");
  }

  const isAuthor = reply.author.toString() === userId;

  if (!isAuthor) {
    throw createError(
      403,
      "You can only edit your own reply",
    );
  }

  reply.content = content.trim();

  await reply.save();

  return Reply.findById(reply._id)
    .populate("author", "name avatar")
    .lean();
};

export const deleteReply = async (
  replyId,
  userId,
) => {
  const reply = await Reply.findById(replyId);

  if (!reply || reply.status === "removed") {
    throw createError(404, "Reply not found");
  }

  const isAuthor = reply.author.toString() === userId;

  if (!isAuthor) {
    throw createError(
      403,
      "You can only delete your own reply",
    );
  }

  reply.status = "removed";

  await reply.save();

  return reply;
};