import { Link } from "react-router-dom";

import { icons } from "../common/ui";

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
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

/**
 * Compact discussion row used on the landing page.
 *
 * Deliberately leaner than `Discussions/DiscussionCard` (which is the full
 * list-view card): the landing page shows a preview of activity, not a
 * complete reading surface.
 */
const RecentDiscussionCard = ({ discussion }) => {
  if (!discussion) return null;

  const id = discussion._id ?? discussion.id;
  const authorName =
    typeof discussion.author === "object"
      ? discussion.author?.name
      : discussion.author;
  const categoryName =
    typeof discussion.category === "object"
      ? discussion.category?.name
      : discussion.category;

  const replyCount = discussion.replyCount ?? discussion.repliesCount;
  const EyeIcon = icons.eye;
  const ArrowIcon = icons.arrowRight;

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 capitalize">
            {categoryName}
          </span>
        ) : null}

        {discussion.createdAt ? (
          <time dateTime={discussion.createdAt} className="text-xs text-slate-500">
            {formatDate(discussion.createdAt)}
          </time>
        ) : null}
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900">
        <Link
          to={`/discussions/${id}`}
          className="rounded after:absolute after:inset-0 hover:text-blue-700 focus:outline-none"
        >
          {discussion.title || "Untitled discussion"}
        </Link>
      </h3>

      {discussion.content ? (
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {discussion.content}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
            {initials(authorName)}
          </span>

          <span className="truncate text-xs text-slate-500">
            {authorName || "Forum member"}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-slate-500">
          {replyCount !== undefined ? (
            <span>
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          ) : null}

          {discussion.views !== undefined ? (
            <span className="inline-flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {discussion.views}
            </span>
          ) : null}

          <ArrowIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
        </div>
      </div>
    </article>
  );
};

export default RecentDiscussionCard;
