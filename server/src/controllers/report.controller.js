import {
  createReport,
  getReportById,
  getReports,
} from "../services/report.service.js";

import {
  createdResponse,
  successResponse,
} from "../utils/apiResponse.js";

export const create = async (req, res) => {
  const report = await createReport({
    reportedBy: req.user.id,
    discussion: req.body.discussion,
    reply: req.body.reply,
    reason: req.body.reason,
  });

  return createdResponse(res, {
    message: "Report submitted successfully",
    data: {
      report,
    },
  });
};

export const getAll = async (req, res) => {
  const reports = await getReports();

  return successResponse(res, {
    message: "Reports retrieved successfully",
    data: {
      reports,
    },
  });
};

export const getOne = async (req, res) => {
  const report = await getReportById(req.params.id);

  return successResponse(res, {
    message: "Report retrieved successfully",
    data: {
      report,
    },
  });
};
