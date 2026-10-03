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

export const getDiscussions = async ({
  category,
  page = 1,
  limit = 10,
  sort = "latest",
}) => {
  const filter = {
    status: { $ne: "removed" },
  };

  // Filter by category
  if (category) {
    filter.category = category;
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Sorting
  let sortOption;

  switch (sort) {
    case "oldest":
      sortOption = { createdAt: 1 };
      break;

    case "popular":
      sortOption = { views: -1, createdAt: -1 };
      break;

    case "latest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [discussions, total] = await Promise.all([
    Discussion.find(filter)
      .populate("author", "name avatar")
      .populate("category", "name")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),

    Discussion.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    discussions,
    pagination: {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
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