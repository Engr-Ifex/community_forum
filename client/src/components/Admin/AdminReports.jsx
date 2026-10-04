import { useState } from "react";
import { Link } from "react-router-dom";

import { getId } from "../../utils/identity";

import { formatDateTime, truncate } from "./adminFormat";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-600",
  reviewed: "bg-blue-50 text-blue-700",
};

const STATUS_FILTERS = ["all", "pending", "resolved", "dismissed"];

/**
 * Section 5 - Reports.
 *
 * Read-only: this is the admin's view of the queue, not a second moderation
 * console. Acting on a report stays with /moderation so there is one place where
 * moderation decisions are made (and one audit trail).
 */
const AdminReports = ({ reports }) => {
  const [statusFilter, setStatusFilter] = useState("all");

  const counts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  const visible = reports.filter(
    (report) => statusFilter === "all" || report.status === statusFilter,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            aria-pressed={statusFilter === value}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
              statusFilter === value
                ? "bg-blue-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {value} ({counts[value]})
          </button>
        ))}

        <Link
          to="/moderation"
          className="ml-auto text-sm font-medium text-blue-700 hover:underline"
        >
          Go to moderation queue →
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          {reports.length === 0
            ? "No reports have been submitted yet."
            : "No reports match this filter."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Target</th>
                <th scope="col" className="px-4 py-3 font-medium">Reason</th>
                <th scope="col" className="px-4 py-3 font-medium">Reporter</th>
                <th scope="col" className="px-4 py-3 font-medium">Reviewed by</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((report) => {
                const isReply = Boolean(report.reply);
                const discussionId = getId(report.discussion);

                return (
                  <tr
                    key={report._id}
                    className="border-b border-slate-100 last:border-0 align-top"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          STATUS_STYLES[report.status] ?? STATUS_STYLES.reviewed
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-500">
                        {isReply ? "reply" : "discussion"}
                      </span>

                      <p className="mt-0.5 max-w-xs text-slate-800">
                        {isReply
                          ? truncate(report.reply?.content, 80)
                          : report.discussion?.title || "(unavailable)"}
                      </p>

                      {discussionId && report.discussion?.status !== "removed" ? (
                        <Link
                          to={`/discussions/${discussionId}`}
                          className="text-xs font-medium text-blue-700 hover:underline"
                        >
                          View thread
                        </Link>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 max-w-xs text-slate-600">
                      {truncate(report.reason, 120)}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {report.reportedBy?.name ?? "unknown"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {report.reviewedBy?.name ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {formatDateTime(report.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
