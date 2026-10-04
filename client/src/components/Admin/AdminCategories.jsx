import { buttonClass, icons } from "../common/ui";

import { formatDate } from "./adminFormat";

/**
 * Section 3 - Categories.
 *
 * Reuses the same `CategoryFormDialog` and `CategoryDeleteDialog` the public
 * Categories page uses, so create/edit/delete validation and the "deleting a
 * category does not cascade" warning stay in one place instead of being
 * reimplemented here.
 */
const AdminCategories = ({ categories, busyId, onCreate, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>

        <button
          type="button"
          onClick={onCreate}
          className={buttonClass("primary", "sm")}
        >
          <icons.plus className="h-4 w-4" />
          New category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">No categories yet.</p>

          <button
            type="button"
            onClick={onCreate}
            className={buttonClass("primary", "sm", "mt-4")}
          >
            <icons.plus className="h-4 w-4" />
            Create the first category
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {categories.map((category) => (
            <li
              key={category._id}
              className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <h3 className="font-semibold capitalize text-slate-900">
                  {category.name}
                </h3>

                {category.description ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {category.description}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-slate-400">No description</p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  Created {formatDate(category.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  disabled={busyId === category._id}
                  className={buttonClass("secondary", "sm")}
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(category)}
                  disabled={busyId === category._id}
                  className={buttonClass(
                    "secondary",
                    "sm",
                    "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
                  )}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminCategories;
