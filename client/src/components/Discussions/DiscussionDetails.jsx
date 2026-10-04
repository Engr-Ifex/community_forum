import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DeleteDiscussion from "./DeleteDiscussion";
import ReplyForm from "./ReplyForm";
import ReportButton from "../Moderation/ReportButton";

function DiscussionDetails({
  discussion,
  onBack,
  onEdit,
  onDelete,
  onReply,
  onDeleteReply,
}) {
  const { user, isAuthenticated } = useAuth();

  if (!discussion) {
    return <p role="status">Discussion not found.</p>;
  }

  const discussionId =
    discussion.id ?? discussion._id;

  const authorName =
    typeof discussion.author === "string"
      ? discussion.author
      : discussion.author?.username ??
        discussion.author?.name ??
        "Unknown author";

  const currentUserName =
    user?.username ??
    user?.name ??
    user?.email ??
    "You";

  const isAdmin =
    isAuthenticated && user?.role === "admin";

  const isModerator =
    isAuthenticated && user?.role === "moderator";

  const isDiscussionOwner =
    isAuthenticated &&
    (authorName === "You" ||
      authorName === currentUserName);

  const canManageDiscussion =
    isAdmin || isDiscussionOwner;

  const canDeleteReplies =
    isAdmin ||
    isModerator ||
    isDiscussionOwner;

  const createdAt =
    discussion.createdAt ?? discussion.date;

  const parsedDate = createdAt
    ? new Date(createdAt)
    : null;

  const displayDate =
    parsedDate &&
    !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString()
      : createdAt;

  const replies = Array.isArray(
    discussion.replies,
  )
    ? discussion.replies
    : [];

  const replyCount =
    discussion.replyCount ??
    (Array.isArray(discussion.replies)
      ? discussion.replies.length
      : discussion.replies ?? 0);

  return (
    <article className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-medium text-slate-700 hover:underline"
      >
        ← Back
      </button>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          {discussion.title || "Untitled discussion"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Posted by{" "}
          <Link
            to={`/profile/${encodeURIComponent(authorName)}`}
            className="font-medium text-slate-800 hover:underline"
          >
            {authorName}
          </Link>

          {displayDate && ` · ${displayDate}`}
        </p>

        {isAuthenticated && (
          <ReportButton
            contentType="discussion"
            contentId={discussionId}
          />
        )}
      </header>

      <div className="py-6 leading-7 text-slate-800">
        {discussion.content ||
          "No discussion content."}
      </div>

      <div className="mt-6">
        <h2 className="text-2xl font-semibold">
          Replies
        </h2>

        {replies.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {replies.map((reply, replyIndex) => {
              const replyId =
                reply.id ??
                reply._id ??
                replyIndex;

              const replyAuthor =
                typeof reply.author === "string"
                  ? reply.author
                  : reply.author?.username ??
                    reply.author?.name ??
                    "Unknown author";

              return (
                <li
                  key={replyId}
                  className="border-l-2 border-slate-200 pl-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        <Link
                          to={`/profile/${encodeURIComponent(
                            replyAuthor,
                          )}`}
                          className="hover:underline"
                        >
                          {replyAuthor}
                        </Link>
                      </p>

                      <p className="mt-1 text-slate-700">
                        {reply.content ??
                          reply.body ??
                          ""}
                      </p>

                      {isAuthenticated && (
                        <ReportButton
                          contentType="reply"
                          contentId={replyId}
                          discussionId={discussionId}
                        />
                      )}
                    </div>

                    {canDeleteReplies &&
                      onDeleteReply && (
                        <DeleteDiscussion
                          discussionId={replyId}
                          onDelete={onDeleteReply}
                          label="Delete reply"
                          confirmationTitle="Delete reply?"
                          confirmationMessage="Are you sure you want to delete this reply? This action cannot be undone."
                        />
                      )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            No replies yet.
          </p>
        )}

        {isAuthenticated && (
          <ReplyForm onReply={onReply} />
        )}
      </section>

      {canManageDiscussion && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={() =>
              onEdit?.(discussion)
            }
            className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Edit discussion
          </button>

          <DeleteDiscussion
            discussionId={discussionId}
            onDelete={onDelete}
          />
        </div>
      </div>

      <form
        onSubmit={handleReply}
        className="mt-6 rounded-lg border border-slate-200 bg-white p-5"
      >
        <h2 className="text-xl font-semibold">
          Reply
        </h2>

        <textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write your reply..."
          rows={4}
          className="mt-4 w-full rounded-md border border-slate-300 p-3"
        />

        <button
          type="submit"
          className="mt-3 rounded-md bg-slate-900 px-5 py-2 text-white"
        >
          Reply
        </button>
      </form>
    </section>
  );
};

export default DiscussionDetails;