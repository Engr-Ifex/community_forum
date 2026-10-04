import api from "./api";

/*
 * Report endpoints.
 *
 * Creating a report requires a signed-in user; listing and reading them
 * requires moderator or admin rights.
 */

// body: { discussion: <id> } or { reply: <id> } plus { reason }
export const createReport = (payload) => api.post("/reports", payload);

export const getReports = () => api.get("/reports");
