import { Link } from "react-router-dom";

import { getId } from "../../utils/identity";
import { buttonClass, icons } from "../common/ui";

const FlagIcon = icons.flag;
const LockIcon = icons.lock;
const TrashIcon = icons.trash;
const CheckIcon = icons.check;
const ChatIcon = icons.chat;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
  dismissed: "bg-slate-100 text-slate-600",
  reviewed: "bg-blue-50 text-blue-700",
};

const truncate = (value, max = 200) => {
  if (!value) return "";
  const text = String(value);

  return text.length > max ? `${text.slice(0, max)}…` : text;
};

/**
 * One row in the moderation queue.
 *
 * Shows who reported what, why, and when - then offers the two report outcomes
 * (resolve / dismiss) plus content actions (lock / remove) where they apply.
 *
 * A report's `discussion` and `reply` are populated by the backend, but either
 * can be `null` if the content was hard-deleted, so every read is defensive.
 */
const ReportRow = ({ report, busy, onResolve, onDismiss, onLock, onRemove }) => {
  const discussion = report.discussion;
  const reply = report.reply;

  const isReplyReport = Boolean(reply);
  const isPending = report.status === "pending";

  const discussionId = getId(discussion);
  const discussionStatus = discussion?.status;

  const reportedTitle = isReplyReport
    ? "Reported reply"
    : discussion?.title || "(discussion unavailable)";

  const reportedBody = isReplyReport ? reply?.content : discussion?.content;

  // Lock is meaningless for an already locked or removed thread, and the
  // backend rejects both with a 400 - so the control is hidden rather than
  // offered and then refused.
  const canLock =
    Boolean(discussionId) &&
    discussionStatus !== "locked" &&
    discussionStatus !== "removed";

  const canRemoveContent =
    (isReplyReport && Boolean(getId(reply))) ||
    (!isReplyReport && Boolean(discussionId) && discussionStatus !== "removed");

  const reporterName = report.reportedBy?.name ?? "unknown";

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
            STATUS_STYLES[report.status] ?? STATUS_STYLES.reviewed
          }`}
        >
          {report.status}
        </span>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {isReplyReport ? (
            <ChatIcon className="h-3.5 w-3.5" />
          ) : (
            <FlagIcon className="h-3.5 w-3.5" />
          )}
          {isReplyReport ? "reply" : "discussion"}
        </span>

        {discussionStatus && discussionStatus !== "active" ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium capitalize text-amber-700">
            {discussionStatus}
          </span>
        ) : null}

        <time className="ml-auto text-sm text-slate-500">
          {formatDate(report.createdAt)}
        </time>
      </div>

      <h2 className="mt-3 text-lg font-semibold text-slate-900">
        {reportedTitle}
      </h2>

      {reportedBody ? (
        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
          {truncate(reportedBody)}
        </p>
      ) : null}

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm text-slate-800">
          <span className="font-medium">Reason: </span>
          {report.reason}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Reported by {reporterName}
          {report.reviewedBy?.name ? ` · reviewed by ${report.reviewedBy.name}` : ""}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {discussionId ? (
          <Link
            to={`/discussions/${discussionId}`}
            className={buttonClass("ghost", "sm")}
          >
            View thread
          </Link>
        ) : null}

        {isPending ? (
          <>
            <button
              type="button"
              onClick={onResolve}
              disabled={busy}
              className={buttonClass("secondary", "sm", "border-emerald-200 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50")}
            >
              <CheckIcon className="h-4 w-4" />
              Resolve
            </button>

            <button
              type="button"
              onClick={onDismiss}
              disabled={busy}
              className={buttonClass("secondary", "sm")}
            >
              Dismiss
            </button>

            {canLock ? (
              <button
                type="button"
                onClick={onLock}
                disabled={busy}
                className={buttonClass("secondary", "sm")}
              >
                <LockIcon className="h-4 w-4" />
                Lock
              </button>
            ) : null}

            {canRemoveContent ? (
              <button
                type="button"
                onClick={onRemove}
                disabled={busy}
                className={buttonClass(
                  "secondary",
                  "sm",
                  "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
                )}
              >
                <TrashIcon className="h-4 w-4" />
                Remove {isReplyReport ? "reply" : "discussion"}
              </button>
            ) : null}
          </>
        ) : (
          <span className="text-sm text-slate-500">
            No actions - this report is already {report.status}.
          </span>
        )}
      </div>
    </li>
  );
};

export default ReportRow;
