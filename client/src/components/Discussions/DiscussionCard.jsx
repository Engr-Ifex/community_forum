import { Link } from "react-router-dom";

import { getId } from "../../utils/identity";
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

const EyeIcon = icons.eye;
const ChatIcon = icons.chat;
const ArrowIcon = icons.arrowRight;
const ShieldIcon = icons.shield;

/**
 * Discussion row for the list view.
 *
 * Only fields the API actually models are rendered - no internal Mongoose
 * fields, no raw ObjectIds. Category and author arrive populated from the
 * backend, so they are read as objects with a string fallback.
 */
const DiscussionCard = ({ discussion }) => {
  if (!discussion) return null;

  const discussionId = getId(discussion);

  const authorName =
    typeof discussion.author === "object"
      ? discussion.author?.name ?? discussion.author?.username
      : discussion.author;

  const categoryName =
    typeof discussion.category === "object"
      ? discussion.category?.name
      : discussion.category;

  const replyCount =
    discussion.replyCount ??
    discussion.repliesCount ??
    (Array.isArray(discussion.replies) ? discussion.replies.length : undefined);

  const body = discussion.content ?? discussion.body ?? "";

  const isLocked = discussion.status === "locked";
  const isRemoved = discussion.status === "removed";

  return (
    <article className="group relative rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
      <div className="flex flex-wrap items-center gap-2">
        {categoryName ? (
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium capitalize text-blue-700">
            {categoryName}
          </span>
        ) : null}

        {isLocked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <ShieldIcon className="h-3.5 w-3.5" />
            Locked
          </span>
        ) : null}

        {isRemoved ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
            Removed
          </span>
        ) : null}

        {discussion.createdAt ? (
          <time dateTime={discussion.createdAt} className="text-xs text-slate-500">
            {formatDate(discussion.createdAt)}
          </time>
        ) : null}
      </div>

      <h2 className="mt-3 text-lg font-semibold leading-snug text-slate-900">
        {discussionId ? (
          <Link
            to={`/discussions/${discussionId}`}
            // The pseudo-element stretches the link over the whole card, so the
            // entire row is clickable while keeping one accessible name.
            className="rounded after:absolute after:inset-0 hover:text-blue-700 focus:outline-none"
          >
            {discussion.title || "Untitled discussion"}
          </Link>
        ) : (
          discussion.title || "Untitled discussion"
        )}
      </h2>

      {body ? (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
          {body}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
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
            <span className="inline-flex items-center gap-1">
              <ChatIcon className="h-3.5 w-3.5" />
              {replyCount}
            </span>
          ) : null}

          {discussion.views !== undefined ? (
            <span className="inline-flex items-center gap-1">
              <EyeIcon className="h-3.5 w-3.5" />
              {discussion.views}
            </span>
          ) : null}

          {discussionId ? (
            <span className="inline-flex items-center gap-1 font-medium text-slate-600 group-hover:text-blue-700">
              View
              <ArrowIcon className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default DiscussionCard;
