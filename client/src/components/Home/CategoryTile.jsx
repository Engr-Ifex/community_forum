import { Link } from "react-router-dom";

import { icons } from "../common/ui";

/**
 * Category tile for the landing page grid.
 *
 * The whole card is one link with a single accessible name; the inner heading
 * is the visual label. A per-letter monogram keeps the grid colourful without
 * needing an icon library or per-category artwork.
 */
const CategoryTile = ({ category }) => {
  if (!category) return null;

  const id = category._id ?? category.id;
  const name = category.name ?? "Uncategorised";
  const ArrowIcon = icons.arrowRight;

  const monogram = name.trim().charAt(0).toUpperCase();

  return (
    <Link
      to={`/categories/${id}`}
      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-base font-bold text-white">
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
          {category.description || "Browse the conversations in this category."}
        </span>
      </span>
    </Link>
  );
};

export default CategoryTile;
