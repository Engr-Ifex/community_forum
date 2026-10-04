import { Link } from "react-router-dom";

import { icons } from "../common/ui";
import { getId } from "../../utils/identity";

/**
 * Category card.
 *
 * Reusable across the categories index (and anywhere else a category needs a
 * tile). The whole card is one link carrying a single accessible name, so the
 * hit target is the full surface rather than the heading text alone.
 *
 * `actions` renders admin-only controls. They are deliberately placed OUTSIDE
 * the link, because a button nested inside an anchor is invalid HTML and would
 * make the link and the button fight for the same click.
 */
const CategoryCard = ({ category, actions = null, discussionCount = null }) => {
  if (!category) return null;

  const id = getId(category);
  const name = category.name ?? "Uncategorised";
  const description =
    category.description || "Browse the conversations in this category.";

  const ArrowIcon = icons.arrowRight;
  const ChatIcon = icons.chat;

  const monogram = name.trim().charAt(0).toUpperCase() || "?";

  const card = (
    <Link
      to={`/categories/${id}`}
      className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      aria-label={`${name} - ${description}`}
    >
      <span className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white"
        >
          {monogram}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate font-semibold capitalize text-slate-900">
              {name}
            </span>

            <ArrowIcon className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
          </span>

          <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-slate-600">
            {description}
          </span>
        </span>
      </span>

      {discussionCount !== null ? (
        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <ChatIcon className="h-3.5 w-3.5 text-slate-400" />
          {discussionCount} {discussionCount === 1 ? "discussion" : "discussions"}
        </span>
      ) : null}
    </Link>
  );

  // Without actions the card is returned bare, so callers that only need a
  // tile do not pay for an extra wrapper element.
  if (!actions) return card;

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-blue-300 hover:shadow-md">
      <Link
        to={`/categories/${id}`}
        className="group flex flex-1 flex-col rounded-t-xl p-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600"
        aria-label={`${name} - ${description}`}
      >
        <span className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white"
          >
            {monogram}
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate font-semibold capitalize text-slate-900">
              {name}
            </span>

            <span className="mt-1 block line-clamp-2 text-sm leading-relaxed text-slate-600">
              {description}
            </span>
          </span>
        </span>
      </Link>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-3">
        {actions}
      </div>
    </div>
  );
};
};

export default CategoryCard;
