import api from "./api";

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