import { useEffect, useState } from "react";

import { getUser } from "../../services/admin";
import { getId, isSameId } from "../../utils/identity";
import { buttonClass, icons, Skeleton } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

import { formatDate } from "./adminFormat";

const ROLES = ["user", "moderator", "admin"];

const ROLE_STYLES = {
  admin: "bg-blue-50 text-blue-700",
  moderator: "bg-amber-50 text-amber-700",
  user: "bg-slate-100 text-slate-600",
};

const RoleBadge = ({ role }) => (
  <span
    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
      ROLE_STYLES[role] ?? ROLE_STYLES.user
    }`}
  >
    {role}
  </span>
);

/**
 * Read-only detail panel for a single user (GET /admin/users/:id).
 *
 * Loaded on demand rather than with the list, so opening the console does not
 * fire one request per user.
 */
const UserDetail = ({ userId, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignoreResponse = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getUser(userId);

        if (!ignoreResponse) {
          setUser(response.data?.user ?? null);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setError(requestError.message);
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignoreResponse = true;
    };
  }, [userId]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">User details</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <icons.close className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : error ? (
          <div className="mt-5">
            <ErrorMessage message={error} />
          </div>
        ) : user ? (
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium text-slate-900">{user.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Role</dt>
              <dd>
                <RoleBadge role={user.role} />
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Status</dt>
              <dd
                className={`font-medium ${
                  user.isActive ? "text-emerald-700" : "text-slate-500"
                }`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Joined</dt>
              <dd className="text-slate-900">{formatDate(user.createdAt)}</dd>
            </div>
            {user.bio ? (
              <div>
                <dt className="text-slate-500">Bio</dt>
                <dd className="mt-1 whitespace-pre-wrap text-slate-800">{user.bio}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={buttonClass("secondary", "md")}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
};

/**
 * Section 2 - User management.
 *
 * Two backend guards shape this UI:
 *  - an admin cannot change their own role (400 "You cannot change your own
 *    admin role"),
 *  - an admin cannot deactivate their own account (400 "You cannot deactivate
 *    your own account").
 * Both controls are therefore disabled on the acting admin's own row, rather
 * than offered and then refused.
 *
 * Deactivation is a DELETE; reactivation is a PATCH { isActive: true } - the two
 * directions use different endpoints, which is why they are handled separately.
 */
const AdminUsers = ({ users, currentUserId, busyId, onView, onRoleChange, onToggleActive }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const term = search.trim().toLowerCase();

  const visible = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (!term) return true;

    return `${user.name ?? ""} ${user.email ?? ""}`.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2">
          {["all", ...ROLES].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRoleFilter(value)}
              aria-pressed={roleFilter === value}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                roleFilter === value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        <div className="ml-auto w-full sm:w-64">
          <label htmlFor="admin-user-search" className="sr-only">
            Search users
          </label>

          <input
            id="admin-user-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
          {users.length === 0 ? "No users found." : "No users match this filter."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Role</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                <th scope="col" className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {visible.map((user) => {
                const isSelf = isSameId(user, currentUserId);
                const busy = busyId === getId(user);

                return (
                  <tr key={getId(user)} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {user.name}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-slate-400">(you)</span>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-slate-600">{user.email}</td>

                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(event) => onRoleChange(user, event.target.value)}
                        disabled={isSelf || busy}
                        aria-label={`Role for ${user.name}`}
                        title={
                          isSelf
                            ? "You cannot change your own role"
                            : undefined
                        }
                        className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.isActive ? "active" : "inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(user.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(getId(user))}
                          className={buttonClass("secondary", "sm")}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => onToggleActive(user)}
                          disabled={isSelf || busy}
                          title={
                            isSelf
                              ? "You cannot deactivate your own account"
                              : undefined
                          }
                          className={buttonClass(
                            user.isActive ? "danger" : "primary",
                            "sm",
                            "disabled:opacity-50",
                          )}
                        >
                          {user.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                      </div>
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

export { UserDetail };
export default AdminUsers;
