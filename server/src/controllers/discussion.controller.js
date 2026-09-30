import {
  createDiscussion,
  deleteDiscussion,
  getDiscussionById,
  getDiscussions,
  incrementDiscussionViews,
  updateDiscussion,
} from "../services/discussion.service.js";

import {
  createdResponse,
  successResponse,
} from "../utils/apiResponse.js";

export const create = async (req, res) => {
  const discussion = await createDiscussion({
    ...req.body,
    author: req.user.id,
  });

  return createdResponse(res, {
    message: "Discussion created successfully",
    data: { discussion },
  });
};

export const getAll = async (req, res) => {
  const discussions = await getDiscussions();

  return successResponse(res, {
    message: "Discussions retrieved successfully",
    data: { discussions },
  });
};

export const getOne = async (req, res) => {
  const discussion = await incrementDiscussionViews(
    req.params.id,
  );

  return successResponse(res, {
    message: "Discussion retrieved successfully",
    data: { discussion },
  });
};

export const update = async (req, res) => {
  const discussion = await updateDiscussion(
    req.params.id,
    req.body,
    req.user.id,
    req.user.role,
  );

  return successResponse(res, {
    message: "Discussion updated successfully",
    data: { discussion },
  });
};

export const remove = async (req, res) => {
  await deleteDiscussion(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  return successResponse(res, {
    message: "Discussion deleted successfully",
  });
};
