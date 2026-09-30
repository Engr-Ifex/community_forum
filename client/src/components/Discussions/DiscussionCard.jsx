
import DeleteDiscussion from "./DeleteDiscussion";

function DiscussionCard({ discussion, onView, onDelete }) {
  if (!discussion) return null;

  const discussionId = discussion.id ?? discussion._id;
  const hasDiscussionId =
    discussionId !== undefined && discussionId !== null && discussionId !== "";
  const authorName =
    typeof discussion.author === "string"
      ? discussion.author
      : discussion.author?.username ?? discussion.author?.name ?? "Unknown author";
  const replyCount = Array.isArray(discussion.replies)
    ? discussion.replies.length
    : discussion.replies ?? 0;

  return (
    <article className="rounded border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {discussion.title || "Untitled discussion"}
      </h2>

      {discussion.content && <p className="mt-2 text-slate-700">{discussion.content}</p>}

      <p className="mt-3 text-sm text-slate-600">
        Posted by {authorName}
      </p>

      <p className="mt-1 text-sm text-slate-600">
        {replyCount} {replyCount === 1 ? "reply" : "replies"}
      </p>

      {(onView || onDelete) && hasDiscussionId && (
        <div className="mt-4 flex flex-wrap gap-2">
          {onView && (
            <button
              type="button"
              onClick={() => onView(discussionId)}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
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