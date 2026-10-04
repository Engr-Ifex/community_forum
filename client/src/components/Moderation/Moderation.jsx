import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getReports } from "../../services/reports";
import {
  dismissReport,
  lockDiscussion,
  removeDiscussion,
  removeReply,
  resolveReport,
} from "../../services/moderation";
import { getId } from "../../utils/identity";
import { buttonClass, ErrorState, icons, Notice, Skeleton } from "../common/ui";

import ModerationActionDialog from "./ModerationActionDialog";
import ReportRow from "./ReportRow";

const ShieldIcon = icons.shield;

const FILTERS = [
  ["pending", "Pending"],
  ["resolved", "Resolved"],
  ["dismissed", "Dismissed"],
  ["all", "All"],
];

/**
 * Moderation console.
 *
 * Reports are the unit of work: a moderator reads the reason alongside the
 * reported content, then either:
 *   - resolves the report (the content was actioned) or dismisses it, and/or
 *   - acts on the content itself (lock / remove a discussion, remove a reply).
 *
 * Those are deliberately separate steps. The backend does NOT cascade a report
 * outcome onto the content, so resolving a report is a bookkeeping act, not a
 * deletion - the UI says so rather than implying otherwise.
 *
 * Authorization: every endpoint here requires moderator or admin, and the
 * backend is the final authority. A 401/403 is rendered as a plain "no access"
 * explanation rather than an error the app trips over.
 */
const Moderation = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [search, setSearch] = useState("");

  // The dialog currently open, if any:
  //   { kind: "resolve"|"dismiss"|"lock"|"remove-discussion"|"remove-reply",
  //     report?, title, description, confirmLabel, tone, requireReason }
  const [dialog, setDialog] = useState(null);

  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const response = await getReports();
      const list = response.data?.reports;

      setReports(Array.isArray(list) ? list : []);
    } catch (requestError) {
      // 401 (signed out) and 403 (not a moderator) are expected states for a
      // user who followed a stale link - they are not crashes.
      if (requestError.status === 401 || requestError.status === 403) {
        setAccessDenied(true);
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 6000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(
    () => ({
      pending: reports.filter((report) => report.status === "pending").length,
      resolved: reports.filter((report) => report.status === "resolved").length,
      dismissed: reports.filter((report) => report.status === "dismissed").length,
      all: reports.length,
    }),
    [reports],
  );

  const visibleReports = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reports.filter((report) => {
      if (statusFilter !== "all" && report.status !== statusFilter) {
        return false;
      }

      if (!term) return true;

      const haystack = [
        report.reason,
        report.discussion?.title,
        report.reply?.content,
        report.reportedBy?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [reports, statusFilter, search]);

  const closeDialog = () => {
    if (busyId) return;

    setDialog(null);
    setActionError("");
  };

  // --- dialog openers -----------------------------------------------------

  const openResolve = (report) =>
    setDialog({
      kind: "resolve",
      report,
      title: "Resolve this report",
      description:
        "Mark the report as resolved. This records the outcome only - it does not change or remove the reported content.",
      confirmLabel: "Resolve",
      tone: "positive",
      reasonLabel: "Resolution note (optional)",
    });

  const openDismiss = (report) =>
    setDialog({
      kind: "dismiss",
      report,
      title: "Dismiss this report",
      description:
        "Dismiss the report if no action is needed. The content stays exactly as it is.",
      confirmLabel: "Dismiss",
      reasonLabel: "Dismissal note (optional)",
    });

  const openLock = (discussion) =>
    setDialog({
      kind: "lock",
      targetId: getId(discussion),
      title: "Lock this discussion",
      description:
        "The thread stays readable, but new replies are closed. Locking cannot be undone from the app.",
      confirmLabel: "Lock discussion",
      reasonLabel: "Reason (optional)",
    });

  const openRemove = (report) => {
    const discussionId = getId(report.discussion);
    const replyId = getId(report.reply);

    if (discussionId) {
      setDialog({
        kind: "remove-discussion",
        targetId: discussionId,
        title: "Remove this discussion",
        description:
          "The discussion is hidden from the forum (status set to removed). This is a moderator action recorded in the audit log.",
        confirmLabel: "Remove discussion",
        tone: "danger",
        reasonLabel: "Reason (optional)",
      });
    } else if (replyId) {
      setDialog({
        kind: "remove-reply",
        targetId: replyId,
        title: "Remove this reply",
        description:
          "The reply is hidden from the thread (status set to removed). This is a moderator action recorded in the audit log.",
        confirmLabel: "Remove reply",
        tone: "danger",
        reasonLabel: "Reason (optional)",
      });
    }
  };

  // --- the actual work ----------------------------------------------------

  const runAction = async (reason) => {
    if (!dialog) return;

    setActionError("");
    setBusyId(dialog.report?._id ?? dialog.targetId ?? "action");

    try {
      if (dialog.kind === "resolve") {
        await resolveReport(dialog.report._id, reason);
        setNotice("Report marked as resolved.");
      } else if (dialog.kind === "dismiss") {
        await dismissReport(dialog.report._id, reason);
        setNotice("Report dismissed.");
      } else if (dialog.kind === "lock") {
        await lockDiscussion(dialog.targetId, reason);
        setNotice("Discussion locked.");
      } else if (dialog.kind === "remove-discussion") {
        await removeDiscussion(dialog.targetId, reason);
        setNotice("Discussion removed.");
      } else if (dialog.kind === "remove-reply") {
        await removeReply(dialog.targetId, reason);
        setNotice("Reply removed.");
      }

      setDialog(null);
      await loadReports();
    } catch (requestError) {
      // A 400 here is usually a state clash ("already locked", "only pending
      // reports can be resolved"). Keep the dialog open so the note is not lost
      // and show the backend's own explanation.
      setActionError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  // --- render -------------------------------------------------------------

  if (loading) {
    return (
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Moderation
        </h1>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-3 h-5 w-2/3" />
              <Skeleton className="mt-2 h-4 w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (accessDenied) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          <ShieldIcon className="h-6 w-6" />
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Moderation access required
        </h1>

        <p className="mt-3 text-slate-600">
          This area is for moderators and administrators. If you think you should
          have access, ask an administrator to check your account role.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/discussions" className={buttonClass("primary", "md")}>
            Back to discussions
          </Link>

          <button
            type="button"
            onClick={loadReports}
            className={buttonClass("secondary", "md")}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        className="mx-auto max-w-2xl"
        title="Could not load the moderation queue."
        message={error}
        onRetry={loadReports}
      />
    );
  }

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Moderation
        </h1>

        <p className="mt-2 text-slate-600">
          Review reported content, record the outcome, and act on the content
          where needed.
        </p>
      </div>

      {notice ? (
        <Notice className="mt-6" onDismiss={() => setNotice("")}>
          {notice}
        </Notice>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {FILTERS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            aria-pressed={statusFilter === value}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              statusFilter === value
                ? "bg-blue-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label} ({counts[value]})
          </button>
        ))}

        <div className="ml-auto w-full sm:w-64">
          <label htmlFor="report-search" className="sr-only">
            Search reports
          </label>

          <input
            id="report-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {visibleReports.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            {reports.length === 0
              ? "No reports have been submitted yet."
              : "Nothing matches this filter."}
          </p>
        ) : (
          <ul className="space-y-4">
            {visibleReports.map((report) => (
              <ReportRow
                key={report._id}
                report={report}
                busy={busyId === report._id}
                onResolve={() => openResolve(report)}
                onDismiss={() => openDismiss(report)}
                onLock={() => openLock(report.discussion)}
                onRemove={() => openRemove(report)}
              />
            ))}
          </ul>
        )}
      </div>

      {dialog ? (
        <ModerationActionDialog
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          isBusy={Boolean(busyId)}
          error={actionError}
          busyLabel="Working..."
          reasonLabel={dialog.reasonLabel}
          onCancel={closeDialog}
          onConfirm={runAction}
        />
      ) : null}
    </section>
  );
};

export default Moderation;
