import api from "./api";

/*
 * Reply endpoints.
 *
 * Replies are nested under their discussion. The backend mounts these on the
 * API root, e.g. /discussions/:id/replies and /replies/:id.
 */

export const getReplies = (discussionId) =>
  api.get(`/discussions/${discussionId}/replies`);

export const createReply = (discussionId, content) =>
  api.post(`/discussions/${discussionId}/replies`, { content });

export const updateReply = (replyId, content) =>
  api.patch(`/replies/${replyId}`, { content });

export const deleteReply = (replyId) => api.delete(`/replies/${replyId}`);
