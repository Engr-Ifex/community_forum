import { useState } from "react";

import { icons } from "../common/ui";

import { formatDateTime, moderationActionLabel } from "./adminFormat";

const ACTION_STYLES = {
  remove_discussion: "bg-red-50 text-red-700",
  remove_reply: "bg-red-50 text-red-700",
  lock_discussion: "bg-amber-50 text-amber-700",
  dismiss_report: "bg-slate-100 text-slate-600",
  resolve_report: "bg-emerald-50 text-emerald-700",
};

const ACTION_FILTERS = [
  ["all", "All"],
  ["remove_discussion", "Removed discussions"],
  ["remove_reply", "Removed replies"],
  ["lock_discussion", "Locked"],
  ["resolve_report", "Resolved reports"],
  ["dismiss_report", "Dismissed reports"],
];

/**
 * Section 6 - Moderation history.
 *
 * The audit trail from `ModerationAction`. Note that `target` is a bare
 * ObjectId with no `ref` in the model, so the backend returns it as a string and
 * cannot populate it -- the log therefore shows the raw identifier rather than
 * pretending to know what it points at.
 */
const AdminModerationHistory = ({ actions }) => {
  const [filter, setFilter] = useState("all");

  const visible = actions.filter(
    (action) => filter === "all" || action.action === filter,
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === value
                ? "bg-blue-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          {actions.length === 0
            ? "No moderation actions have been recorded yet."
            : "No actions match this filter."}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((action) => (
            <li
              key={action._id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    ACTION_STYLES[action.action] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {moderationActionLabel(action.action)}
                </span>

                <time className="ml-auto text-sm text-slate-500">
                  {formatDateTime(action.createdAt)}
                </time>
              </div>

              <p className="mt-2 text-sm text-slate-700">
                <span className="font-medium">Moderator: </span>
                {action.moderator?.name ?? "unknown"}
                {action.moderator?.role ? (
                  <span className="ml-1 text-slate-400">
                    ({action.moderator.role})
                  </span>
                ) : null}
              </p>

              {action.reason ? (
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium">Reason: </span>
                  {action.reason}
                </p>
              ) : null}

              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <icons.flag className="h-3.5 w-3.5" />
                target {action.target}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminModerationHistory;
