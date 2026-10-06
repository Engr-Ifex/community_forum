import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { canManageItem, getId, isSameId } from "../../utils/identity";
import {
  deleteDiscussion,
  getDiscussion,
  updateDiscussion,
} from "../../services/discussions";
import { createReply, getReplies } from "../../services/replies";
import { lockDiscussion } from "../../services/moderation";
import { buttonClass, ErrorState, icons, Notice, textareaClass } from "../common/ui";
import ReportDialog from "../Reports/ReportDialog";

import DeleteDiscussionConfirmation from "./DeleteDiscussionConfirmation";
import EditDiscussion from "./EditDiscussion";
import ReplyItem from "./ReplyItem";
import ErrorMessage from "../common/ErrorMessage";
import Loader from "../common/Loader";

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

const initials = (name) => {
  if (!name) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const EyeIcon = icons.eye;
const ChatIcon = icons.chat;
const ShieldIcon = icons.shield;

/**
 * Discussion detail page.
 *
 * The single detail component for the project, routed at /discussions/:id.
 * It always fetches the discussion by id rather than relying on the list having
 * populated some shared state, so a direct link or a refresh works on its own.
 *
 * Locked discussions ("status": "locked") stay readable but accept no replies -
 * the form is replaced by an explanation, matching the backend, which rejects
 * reply creation with 403 on a locked thread.
 */
const DiscussionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);

  // Handed over by CreateDiscussion after a successful publish. Read once on
  // mount, then dropped from history so a later refresh does not re-show it.
  const [notice, setNotice] = useState(location.state?.notice ?? "");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportNotice, setReportNotice] = useState("");

  useEffect(() => {
    if (!location.state?.notice) return undefined;

    window.history.replaceState({}, "");

    const timer = window.setTimeout(() => setNotice(""), 6000);

    return () => window.clearTimeout(timer);
  }, [location.state]);

  const loadReplies = useCallback(async () => {
    try {
      const response = await getReplies(id);
      const list = response.data?.replies;

      setReplies(Array.isArray(list) ? list : []);
    } catch {
      // A thread with no readable replies is not a fatal page error.
      setReplies([]);
    }
  }, [id]);

  useEffect(() => {
    let ignoreResponse = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const response = await getDiscussion(id);

        if (ignoreResponse) return;

        const loaded = response.data?.discussion ?? null;

        if (!loaded) {
          setNotFound(true);
          return;
        }

        setDiscussion(loaded);
        await loadReplies();
      } catch (requestError) {
        if (ignoreResponse) return;

        // The backend returns 404 for a missing OR soft-deleted discussion, so
        // both collapse into the same clean "not found" state.
        if (requestError.status === 404) {
          setNotFound(true);
        } else {
          setError(requestError.message);
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignoreResponse = true;
    };
  }, [id, loadReplies]);

  const authorName =
    typeof discussion?.author === "object"
      ? discussion.author?.name
      : discussion?.author;

  const categoryName =
    typeof discussion?.category === "object"
      ? discussion?.category?.name
      : discussion?.category;

  // Authors and moderators see the edit/delete controls; the backend remains
  // the authority and rejects anything the UI gets wrong.
  const canManage = canManageItem(discussion, user);

  const isLocked = discussion?.status === "locked";

  const isModerator = user?.role === "moderator" || user?.role === "admin";

  const handleSaveEdit = async (updates) => {
    setActionError("");

    try {
      const response = await updateDiscussion(id, {
        title: updates.title,
        content: updates.content,
      });

      setDiscussion(response.data?.discussion ?? discussion);
      setIsEditing(false);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  const handleDelete = async () => {
    setActionError("");
    setIsDeleting(true);

    try {
      await deleteDiscussion(id);
      setShowDeleteConfirm(false);

      // Return to the list carrying a friendly confirmation for it to display.
      navigate("/discussions", {
        replace: true,
        state: { notice: "That discussion was deleted." },
      });
    } catch (requestError) {
      setActionError(requestError.message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Locking is a moderator action and is deliberately one-way: the API has no
  // unlock endpoint, so the control only ever appears on an unlocked thread.
  const handleLock = async () => {
    if (
      !window.confirm(
        "Lock this discussion? Members will no longer be able to reply. This cannot be undone from the app.",
      )
    ) {
      return;
    }

    setActionError("");
    setIsLocking(true);

    try {
      await lockDiscussion(id, "Locked from the discussion page");
      setDiscussion((current) =>
        current ? { ...current, status: "locked" } : current,
      );
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsLocking(false);
    }
  };

  const handleReplySubmit = async (event) => {
    event.preventDefault();

    if (isLocked || !replyContent.trim()) return;

    setActionError("");
    setIsSubmittingReply(true);

    try {
      await createReply(id, replyContent.trim());
      setReplyContent("");
      await loadReplies();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReport = () => {
    setActionError("");
    setShowReportDialog(true);
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader />
      </div>
    );
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          404
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Discussion not found
        </h1>

        <p className="mt-3 text-slate-600">
          This discussion does not exist, or it was removed by a moderator.
        </p>

        <Link to="/discussions" className={buttonClass("primary", "md", "mt-6")}>
          Back to discussions
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        className="mx-auto max-w-2xl"
        title="Could not load this discussion."
        message={error}
      >
        <Link to="/discussions" className="text-sm font-medium text-red-800 underline">
          Back to discussions
        </Link>
      </ErrorState>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl">
        {actionError ? <ErrorMessage message={actionError} /> : null}

        <div className="mt-4">
          <EditDiscussion
            key={discussion._id}
            discussion={discussion}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      {notice ? (
        <Notice className="mb-6" onDismiss={() => setNotice("")}>
          {notice}
        </Notice>
      ) : null}

      {showDeleteConfirm ? (
        <DeleteDiscussionConfirmation
          isDeleting={isDeleting}
          error={actionError}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setActionError("");
          }}
          onConfirm={handleDelete}
        />
      ) : null}

      {showReportDialog ? (
        <ReportDialog
          discussionId={id}
          onClose={() => setShowReportDialog(false)}
          onSubmitted={() => {
            setReportNotice("Thanks - a moderator will review your report.");
          }}
        />
      ) : null}

      {reportNotice ? (
        <Notice className="mb-6" onDismiss={() => setReportNotice("")}>
          {reportNotice}
        </Notice>
      ) : null}

      <Link
        to="/discussions"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        ← Back to discussions
      </Link>

      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {categoryName ? (
            <Link
              to={`/categories/${getId(discussion?.category)}`}
              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700 transition hover:bg-blue-100"
            >
              {categoryName}
            </Link>
          ) : null}

          {isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              <ShieldIcon className="h-3.5 w-3.5" />
              Locked
            </span>
          ) : null}

          {discussion?.status && !isLocked && discussion.status !== "active" ? (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
              {discussion.status}
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
          {discussion?.title || "Untitled discussion"}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
              {initials(authorName)}
            </span>
            {authorName || "Forum member"}
          </span>

          {formatDate(discussion?.createdAt) ? (
            <time dateTime={discussion.createdAt}>
              {formatDate(discussion.createdAt)}
            </time>
          ) : null}

          {discussion?.views !== undefined ? (
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="h-4 w-4 text-slate-400" />
              {discussion.views} {discussion.views === 1 ? "view" : "views"}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5">
            <ChatIcon className="h-4 w-4 text-slate-400" />
            {replies.length} {replies.length === 1 ? "reply" : "replies"}
          </span>
        </div>
      </header>

      <div className="whitespace-pre-wrap break-words py-6 leading-7 text-slate-800">
        {discussion?.content || "No discussion content."}
      </div>

      {/* Locked notice sits above the replies so it explains their state. */}
      {isLocked ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <ShieldIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="font-semibold text-amber-900">Discussion locked</p>
            <p className="mt-1 text-sm text-amber-800">
              A moderator has locked this thread. It stays readable, but new
              replies are closed.
            </p>
          </div>
        </div>
      ) : null}

      <section className="border-t border-slate-200 py-5" aria-labelledby="replies-heading">
        <h2 id="replies-heading" className="text-lg font-semibold text-slate-900">
          Replies ({replies.length})
        </h2>

        {replies.length > 0 ? (
          <ul className="mt-4 space-y-5">
            {replies.map((reply) => {
              const isOwnReply = Boolean(user) && isSameId(reply.author, user);

              return (
                <ReplyItem
                  key={reply._id}
                  reply={reply}
                  // Authorship decides whether the edit/delete controls appear;
                  // the API is still the authority on whether a write is allowed.
                  isOwn={isOwnReply}
                  // Reporting is for everyone except the author of the reply.
                  canReport={Boolean(user) && !isOwnReply}
                  onChanged={loadReplies}
                />
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            No replies yet.{isLocked ? "" : " Be the first to respond."}
          </p>
        )}
      </section>

      {actionError && !showDeleteConfirm ? (
        <div className="mt-4">
          <ErrorMessage message={actionError} />
        </div>
      ) : null}

      {/* Reply composer - or an explanation of why it is unavailable. */}
      {isLocked ? null : authLoading ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5">
          <Loader />
        </div>
      ) : user ? (
        <form
          onSubmit={handleReplySubmit}
          className="mt-6 rounded-lg border border-slate-200 bg-white p-5"
        >
          <label htmlFor="reply-content" className="text-lg font-semibold text-slate-900">
            Add a reply
          </label>

          <textarea
            id="reply-content"
            value={replyContent}
            onChange={(event) => setReplyContent(event.target.value)}
            placeholder="Write your reply..."
            rows={4}
            maxLength={5000}
            className={textareaClass(false, "mt-4")}
          />

          <div className="mt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmittingReply || !replyContent.trim()}
              className={buttonClass("primary", "sm")}
            >
              {isSubmittingReply ? "Posting..." : "Post reply"}
            </button>

            <span className="text-xs text-slate-500">
              {replyContent.trim().length}/5000
            </span>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-lg border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Sign in to join the conversation.
          </p>

          <div className="flex gap-2">
            <Link to="/login" className={buttonClass("secondary", "sm")}>
              Log in
            </Link>

            <Link to="/register" className={buttonClass("primary", "sm")}>
              Join
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-200 pt-5">
        {canManage ? (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={buttonClass("secondary", "sm")}
            >
              Edit discussion
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
              className={buttonClass(
                "secondary",
                "sm",
                "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
              )}
            >
              Delete discussion
            </button>
          </>
        ) : null}

        {isModerator && !isLocked ? (
          <button
            type="button"
            onClick={handleLock}
            disabled={isLocking}
            className={buttonClass("ghost", "sm")}
          >
            {isLocking ? "Locking..." : "Lock discussion"}
          </button>
        ) : null}

        {user ? (
          <button
            type="button"
            onClick={handleReport}
            className={buttonClass("ghost", "sm")}
          >
            <icons.flag className="h-4 w-4" />
            Report
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default DiscussionDetails;
