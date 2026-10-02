
import DeleteDiscussion from "./DeleteDiscussion";

function DiscussionCard({ discussion, onView, onDelete }) {
  if (!discussion) return null;

  const discussionId = discussion.id ?? discussion._id;
  const hasDiscussionId =
    discussionId !== undefined && discussionId !== null && discussionId !== "";

  const authorName =
    typeof discussion.author === "string"
      ? discussion.author
      : discussion.author?.username ??
        discussion.author?.name ??
        "Unknown author";

  const replyCount = Array.isArray(discussion.replies)
    ? discussion.replies.length
    : discussion.replies ?? 0;

  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300">
      <h2 className="text-lg font-semibold text-slate-900">
        {discussion.title || "Untitled discussion"}
      </h2>

      {discussion.content && (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {discussion.content}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <span>Posted by {authorName}</span>
        <span>•</span>
        <span>
          {replyCount} {replyCount === 1 ? "reply" : "replies"}
        </span>
      </div>

      {(onView || onDelete) && hasDiscussionId && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onView && (
            <button
              type="button"
              onClick={() => onView(discussionId)}
              className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              View discussion
            </button>
          )}

          {onDelete && (
            <DeleteDiscussion
              discussionId={discussionId}
              onDelete={onDelete}
            />
          )}
        </div>
      )}
    </article>
  );
}

export default DiscussionCard;