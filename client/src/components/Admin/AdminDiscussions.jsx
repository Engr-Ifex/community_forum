import { useState } from "react";
import { Link } from "react-router-dom";

import { getId } from "../../utils/identity";
import { icons } from "../common/ui";

import { formatDate, truncate } from "./adminFormat";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  locked: "bg-amber-50 text-amber-700",
  removed: "bg-red-50 text-red-700",
};

const STATUS_FILTERS = ["all", "active", "locked", "removed"];

/**
 * Section 4 - Discussions.
 *
 * Unlike the public list, this shows **every** discussion including locked and
 * removed ones, because the point is moderation visibility. Removed threads are
 * no longer reachable through the public detail route (it 404s), so those rows
 * show their content inline instead of offering a link that would dead-end.
 */
const AdminDiscussions = ({ discussions }) => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const term = search.trim().toLowerCase();

  const counts = {
    all: discussions.length,
    active: discussions.filter((d) => d.status === "active").length,
    locked: discussions.filter((d) => d.status === "locked").length,
    removed: discussions.filter((d) => d.status === "removed").length,
  };

  const visible = discussions.filter((discussion) => {
    if (statusFilter !== "all" && discussion.status !== statusFilter) return false;
    if (!term) return true;

    return `${discussion.title ?? ""} ${discussion.author?.name ?? ""}`
      .toLowerCase()
      .includes(term);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              aria-pressed={statusFilter === value}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                statusFilter === value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {value} ({counts[value]})
            </button>
          ))}
        </div>

        <div className="ml-auto w-full sm:w-64">
          <label htmlFor="admin-discussion-search" className="sr-only">
            Search discussions
          </label>

          <input
            id="admin-discussion-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or author..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          {discussions.length === 0
            ? "No discussions have been created yet."
            : "No discussions match this filter."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Title</th>
                <th scope="col" className="px-4 py-3 font-medium">Author</th>
                <th scope="col" className="px-4 py-3 font-medium">Category</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Views</th>
                <th scope="col" className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((discussion) => {
                const status = discussion.status ?? "active";
                const isRemoved = status === "removed";
                const discussionId = getId(discussion);

                return (
                  <tr
                    key={discussionId}
                    className="border-b border-slate-100 last:border-0 align-top"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {isRemoved ? (
                          <span className="text-slate-900">
                            {discussion.title}
                          </span>
                        ) : (
                          <Link
                            to={`/discussions/${discussionId}`}
                            className="font-medium text-slate-900 hover:text-blue-700 hover:underline"
                          >
                            {discussion.title}
                          </Link>
                        )}

                        {isRemoved ? (
                          <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs text-red-700">
                            <icons.trash className="h-3.5 w-3.5" />
                            hidden
                          </span>
                        ) : null}
                      </div>

                      {isRemoved && discussion.content ? (
                        <p className="mt-1 text-xs text-slate-500">
                          {truncate(discussion.content, 100)}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {discussion.author?.name ?? "unknown"}
                    </td>

                    <td className="px-4 py-3 capitalize text-slate-600">
                      {discussion.category?.name ?? "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {discussion.views ?? 0}
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(discussion.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDiscussions;
