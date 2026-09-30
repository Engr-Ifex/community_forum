import createError from "http-errors";
import Discussion from "../models/Discussion.js";
import Category from "../models/Category.js";

export const createDiscussion = async ({
  title,
  content,
  category,
  author,
}) => {
  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    throw createError(404, "Category not found");
  }

  const discussion = await Discussion.create({
    title: title.trim(),
    content: content.trim(),
    category,
    author,
  });

  return Discussion.findById(discussion._id)
    .populate("author", "name email avatar")
    .populate("category", "name description")
    .lean();
};

export const getDiscussions = async () => {
  return Discussion.find({ status: { $ne: "removed" } })
    .populate("author", "name avatar")
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .lean();
};

export const getDiscussionById = async (discussionId) => {
  const discussion = await Discussion.findById(discussionId)
    .populate("author", "name email avatar bio")
    .populate("category", "name description")
    .lean();

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  if (discussion.status === "removed") {
    throw createError(404, "Discussion not found");
  }

  return discussion;
};

export const updateDiscussion = async (
  discussionId,
  updates,
  userId,
  userRole,
) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  if (discussion.status === "removed") {
    throw createError(404, "Discussion not found");
  }

  const isAuthor = discussion.author.toString() === userId;
  const isModerator =
    userRole === "moderator" || userRole === "admin";

  if (!isAuthor && !isModerator) {
    throw createError(
      403,
      "You do not have permission to edit this discussion",
    );
  }

  if (updates.category !== undefined) {
    const categoryExists = await Category.findById(updates.category);

    if (!categoryExists) {
      throw createError(404, "Category not found");
    }
  }

  if (updates.title !== undefined) {
    discussion.title = updates.title.trim();
  }

  if (updates.content !== undefined) {
    discussion.content = updates.content.trim();
  }

  if (updates.category !== undefined) {
    discussion.category = updates.category;
  }

  await discussion.save();

  return Discussion.findById(discussion._id)
    .populate("author", "name email avatar")
    .populate("category", "name description")
    .lean();
};

export const deleteDiscussion = async (
  discussionId,
  userId,
  userRole,
) => {
  const discussion = await Discussion.findById(discussionId);

  if (!discussion) {
    throw createError(404, "Discussion not found");
  }

  const isAuthor = discussion.author.toString() === userId;
  const isModerator =
    userRole === "moderator" || userRole === "admin";

  if (!isAuthor && !isModerator) {
    throw createError(
      403,
      "You do not have permission to delete this discussion",
    );
  }

  // Soft delete
  discussion.status = "removed";

  await discussion.save();

  return discussion;
};

export const incrementDiscussionViews = async (discussionId) => {
  const discussion = await Discussion.findByIdAndUpdate(
    discussionId,
    { $inc: { views: 1 } },
    { new: true },
  )
    .populate("author", "name email avatar")
    .populate("category", "name description")
    .lean();

  if (!discussion || discussion.status === "removed") {
    throw createError(404, "Discussion not found");
  }

  return discussion;
};