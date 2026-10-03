const formatDate = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
};

const DiscussionCard = ({ discussion }) => {
  const authorName =
    typeof discussion.author === "object"
      ? discussion.author?.name
      : null;

  const categoryName =
    typeof discussion.category === "object"
      ? discussion.category?.name
      : null;

  const replyCount =
    discussion.replyCount ??
    discussion.repliesCount ??
    discussion.replies?.length;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            {categoryName}
          </span>
        ) : null}

        {discussion.createdAt ? (
          <time className="text-sm text-slate-500">
            {formatDate(discussion.createdAt)}
          </time>
        ) : null}
      </div>

      <h2 className="mt-3 text-xl font-semibold text-slate-900">
        {discussion.title || "Untitled discussion"}
      </h2>

      <p className="mt-2 whitespace-pre-wrap text-slate-700">
        {discussion.body || discussion.content || ""}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
        <span>
          Started by {authorName || "Forum member"}
        </span>

        {replyCount !== undefined ? (
          <span>
            {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </span>
        ) : null}
      </div>
    </article>
  );
};

export default DiscussionCard;