import DeleteDiscussion from "./DeleteDiscussion";

function DiscussionDetails({ discussion, onBack, onEdit, onDelete }) {
  if (!discussion) {
    return <p role="status">Discussion not found.</p>;
  }

  const discussionId = discussion.id ?? discussion._id;

  const authorName =
    typeof discussion.author === "string"
      ? discussion.author
      : discussion.author?.username ??
        discussion.author?.name ??
        "Unknown author";

  const createdAt = discussion.createdAt ?? discussion.date;

  const parsedDate = createdAt ? new Date(createdAt) : null;

  const displayDate =
    parsedDate && !Number.isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString()
      : createdAt;

  const replies = Array.isArray(discussion.replies)
    ? discussion.replies
    : null;

  const replyCount = replies
    ? replies.length
    : discussion.replies ?? 0;

  return (
    <article className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-sm font-medium text-slate-700 hover:underline"
      >
        ← Back to discussions
      </button>

      <header className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-semibold text-slate-900">
          {discussion.title || "Untitled discussion"}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Posted by {authorName}
          {displayDate && ` · ${displayDate}`}
        </p>
      </header>

      <div className="py-6 leading-7 text-slate-800">
        {discussion.content || "No discussion content."}
      </div>

      <section
        className="border-t border-slate-200 py-5"
        aria-labelledby="replies-heading"
      >
        <h2
          id="replies-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Replies ({replyCount})
        </h2>

        {replies?.length ? (
          <ul className="mt-4 space-y-4">
            {replies.map((reply, replyIndex) => {
              const replyAuthor =
                typeof reply.author === "string"
                  ? reply.author
                  : reply.author?.username ??
                    reply.author?.name;

              return (
                <li
                  key={reply.id ?? reply._id ?? replyIndex}
                  className="border-l-2 border-slate-200 pl-4"
                >
                  {replyAuthor && (
                    <p className="text-sm font-medium text-slate-900">
                      {replyAuthor}
                    </p>
                  )}

                  <p className="mt-1 text-slate-700">
                    {reply.content ?? reply.body ?? ""}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            {replyCount
              ? `${replyCount} replies`
              : "No replies yet."}
          </p>
        )}
      </section>

      {(onEdit || onDelete) && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-5">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(discussion)}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Edit discussion
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

export default DiscussionDetails