import api from "./api";

/*
 * Moderation endpoints. All of these require moderator or admin rights.
 *
 * Each destructive action accepts an optional { reason }.
 */

export const dismissReport = (reportId, reason = "") =>
  api.patch(`/moderation/reports/${reportId}/dismiss`, { reason });

export const resolveReport = (reportId, reason = "") =>
  api.patch(`/moderation/reports/${reportId}/resolve`, { reason });

export const lockDiscussion = (discussionId, reason = "") =>
  api.patch(`/moderation/discussions/${discussionId}/lock`, { reason });

export const removeDiscussion = (discussionId, reason = "") =>
  api.delete(`/moderation/discussions/${discussionId}`, { data: { reason } });

export const removeReply = (replyId, reason = "") =>
  api.delete(`/moderation/replies/${replyId}`, { data: { reason } });
