import { useState } from "react";

import { deleteReply, updateReply } from "../../services/replies";
import { buttonClass, textareaClass } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";
import ReportDialog from "../Reports/ReportDialog";

/**
 * A single reply.
 *
 * The API only allows the reply's author to edit or delete it, so those controls
 * are shown to the author alone. Moderators remove replies through the
 * moderation endpoints instead (a different action with a different audit trail).
 *
 * Any signed-in user who is *not* the author can report the reply - the same
 * rule the reporting endpoint enforces, with the backend as the final authority.
 */
const ReplyItem = ({ reply, isOwn, canReport = false, onChanged }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(reply.content ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportNotice, setReportNotice] = useState("");

  const handleSave = async () => {
    const content = draft.trim();

    if (!content) {
      setError("Reply cannot be empty.");
      return;
    }

    setError("");
    setBusy(true);

    try {
      await updateReply(reply._id, content);
      setIsEditing(false);
      await onChanged();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this reply? This cannot be undone.")) return;

    setError("");
    setBusy(true);

    try {
      await deleteReply(reply._id);
      await onChanged();
    } catch (requestError) {
      setError(requestError.message);
      setBusy(false);
    }
  };

  return (
    <li className="border-l-2 border-slate-200 pl-4">
      <p className="text-sm font-medium text-slate-900">
        {reply.author?.name ?? "Forum member"}
      </p>

      {isEditing ? (
        <div className="mt-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            className={textareaClass()}
          />

          {error ? (
            <div className="mt-2">
              <ErrorMessage message={error} />
            </div>
          ) : null}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className={buttonClass("primary", "sm")}
            >
              {busy ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDraft(reply.content ?? "");
                setError("");
              }}
              className={buttonClass("secondary", "sm")}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-1 whitespace-pre-wrap break-words text-slate-700">
            {reply.content}
          </p>

          {error ? (
            <div className="mt-2">
              <ErrorMessage message={error} />
            </div>
          ) : null}

          {isOwn ? (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-xs font-medium text-slate-600 hover:underline"
              >
                Edit
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="text-xs font-medium text-red-700 hover:underline disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          ) : canReport ? (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setReportNotice("");
                  setShowReportDialog(true);
                }}
                className="text-xs font-medium text-slate-500 hover:text-red-700 hover:underline"
              >
                Report
              </button>
            </div>
          ) : null}

          {reportNotice ? (
            <p role="status" className="mt-2 text-xs text-emerald-700">
              {reportNotice}
            </p>
          ) : null}
        </>
      )}

      {showReportDialog ? (
        <ReportDialog
          replyId={reply._id}
          onClose={() => setShowReportDialog(false)}
          onSubmitted={() => {
            setReportNotice("Reported - thanks. A moderator will review it.");
          }}
        />
      ) : null}
    </li>
  );
};

export default ReplyItem;
