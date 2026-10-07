import api from "./api";

/*
 * Discussion endpoints.
 *
 * Reads are public; creating/updating/deleting requires authentication and the
 * backend enforces author-or-moderator rules on write operations.
 */

// Ask the backend for one page of discussions using the selected filters.
export const getDiscussions = ({
  search = "",
  category = "",
  page = 1,
  limit = 10,
  sort = "latest",
} = {}) => {
  const params = {
    page,
    limit,
    sort,
  };

  // Don't send empty filters.
  if (search.trim()) {
    params.search = search.trim();
  }

  if (category) {
    params.category = category;
  }

  return api.get("/discussions", { params });
};

export const getDiscussion = (discussionId) =>
  api.get(`/discussions/${discussionId}`);

// body: { title, content, category } - category must be a category id.
export const createDiscussion = (payload) => api.post("/discussions", payload);

export const updateDiscussion = (discussionId, updates) =>
  api.patch(`/discussions/${discussionId}`, updates);

export const deleteDiscussion = (discussionId) =>
  api.delete(`/discussions/${discussionId}`);
