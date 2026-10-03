import {
  createReply,
  deleteReply,
  getRepliesByDiscussion,
  updateReply,
} from "../services/reply.service.js";

import {
  createdResponse,
  successResponse,
} from "../utils/apiResponse.js";

export const create = async (req, res) => {
  const reply = await createReply({
    content: req.body.content,
    discussionId: req.params.id,
    authorId: req.user.id,
  });

  return createdResponse(res, {
    message: "Reply created successfully",
    data: { reply },
  });
};

export const getAll = async (req, res) => {
  const replies = await getRepliesByDiscussion(
    req.params.id,
  );

  return successResponse(res, {
    message: "Replies retrieved successfully",
    data: { replies },
  });
};

export const update = async (req, res) => {
  const reply = await updateReply(
    req.params.id,
    req.body.content,
    req.user.id,
  );

  return successResponse(res, {
    message: "Reply updated successfully",
    data: { reply },
  });
};

export const remove = async (req, res) => {
  await deleteReply(
    req.params.id,
    req.user.id,
  );

  return successResponse(res, {
    message: "Reply deleted successfully",
  });
};
