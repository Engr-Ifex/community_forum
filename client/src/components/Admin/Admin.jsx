import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import {
  deactivateUser,
  getDashboard,
  getDiscussions,
  getModerationActions,
  getReports,
  getUsers,
  updateUser,
} from "../../services/admin";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categories";
import { getId } from "../../utils/identity";
import { buttonClass, ErrorState, icons, Notice, Skeleton } from "../common/ui";
import CategoryDeleteDialog from "../Categories/CategoryDeleteDialog";
import CategoryFormDialog from "../Categories/CategoryFormDialog";

import AdminCategories from "./AdminCategories";
import AdminConfirmDialog from "./AdminConfirmDialog";
import AdminDiscussions from "./AdminDiscussions";
import AdminModerationHistory from "./AdminModerationHistory";
import AdminOverview from "./AdminOverview";
import AdminReports from "./AdminReports";
import AdminUsers, { UserDetail } from "./AdminUsers";

const TABS = [
  ["overview", "Overview"],
  ["users", "Users"],
  ["categories", "Categories"],
  ["discussions", "Discussions"],
  ["reports", "Reports"],
  ["history", "Moderation log"],
];

const SECTIONS = {
  overview: "Overview",
  users: "User management",
  categories: "Category management",
  discussions: "Discussion oversight",
  reports: "Reports",
  history: "Moderation history",
};

const EmptySection = ({ message }) => (
  <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
    {message}
  </p>
);

const AdminSkeletons = () => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>

    <Skeleton className="h-64 w-full rounded-xl" />
  </div>
);

/**
 * Admin console.
 *
 * Six sections mirroring the admin endpoints: aggregate stats, user management,
 * categories, discussion oversight, reports, and the moderation audit log.
 *
 * Everything is loaded once up front and refreshed after a mutation, so the
 * overview counters and the tables can never disagree with each other. The only
 * on-demand load is the per-user detail panel.
 *
 * Authorization is admin-only on the route (`ProtectedRoute roles={["admin"]}`)
 * AND on every endpoint; a 401/403 is rendered as an access notice rather than
 * an error the page trips over.
 */
const Admin = () => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const currentUserId = getId(currentUser);

  const [tab, setTab] = useState("overview");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [reports, setReports] = useState([]);
  const [actions, setActions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  // Dialog state: { kind: "user-role"|"user-active"|"category-delete", ... }
  const [dialog, setDialog] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);
  // { mode: "create"|"edit", category? }
  const [categoryForm, setCategoryForm] = useState(null);
  const [detailCategory, setDetailCategory] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    try {
      const [
        dashboardResponse,
        usersResponse,
        categoriesResponse,
        discussionsResponse,
        reportsResponse,
        actionsResponse,
      ] = await Promise.all([
        getDashboard(),
        getUsers(),
        getCategories(),
        getDiscussions(),
        getReports(),
        getModerationActions(),
      ]);

      setStats(dashboardResponse.data?.dashboard ?? null);
      setUsers(usersResponse.data?.users ?? []);
      // GET /categories returns { data: { categories } }; tolerate a bare
      // array too so a future envelope change cannot silently blank this tab.
      setCategories(
        Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : categoriesResponse.data?.categories ?? [],
      );
      setDiscussions(discussionsResponse.data?.discussions ?? []);
      setReports(reportsResponse.data?.reports ?? []);
      setActions(actionsResponse.data?.actions ?? []);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        setAccessDenied(true);
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wait for the session to resolve so a refresh does not briefly fire these
    // admin-only requests before the cookie is read.
    if (authLoading) return undefined;

    loadAll();
    return undefined;
  }, [authLoading, loadAll]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 6000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  // --- user actions -------------------------------------------------------

  const requestRoleChange = (user, role) => {
    if (role === user.role) return;

    setDialog({
      kind: "user-role",
      user,
      role,
      title: "Change this user's role",
      description: `Set ${user.name}'s role to "${role}". This takes effect immediately and changes what they can access.`,
      confirmLabel: "Change role",
      tone: role === "admin" ? "danger" : "neutral",
    });
  };

  const requestToggleActive = (user) => {
    setDialog({
      kind: "user-active",
      user,
      title: user.isActive ? "Deactivate this user" : "Reactivate this user",
      description: user.isActive
        ? `${user.name} will no longer be able to sign in. You can reactivate them later.`
        : `${user.name} will be able to sign in again.`,
      confirmLabel: user.isActive ? "Deactivate" : "Reactivate",
      tone: user.isActive ? "danger" : "positive",
    });
  };

  const runUserAction = async () => {
    if (!dialog?.user) return;

    const userId = getId(dialog.user);
    setActionError("");
    setBusyId(userId);

    try {
      if (dialog.kind === "user-role") {
        await updateUser(userId, { role: dialog.role });
        setNotice(`Role updated to "${dialog.role}".`);
      } else if (dialog.user.isActive) {
        // Deactivation is a DELETE; reactivation is a PATCH.
        await deactivateUser(userId);
        setNotice(`${dialog.user.name} has been deactivated.`);
      } else {
        await updateUser(userId, { isActive: true });
        setNotice(`${dialog.user.name} has been reactivated.`);
      }

      setDialog(null);
      await loadAll();
    } catch (requestError) {
      // Keep the dialog open so the failure is shown where the action was.
      setActionError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  // --- category actions ---------------------------------------------------

  const handleCategorySubmit = async ({ name, description }) => {
    setBusyId("category");

    try {
      if (categoryForm?.mode === "edit") {
        await updateCategory(getId(categoryForm.category), {
          name,
          // Always send the description so clearing it is possible.
          description,
        });
        setNotice("Category updated.");
      } else {
        await createCategory({ name, description });
        setNotice("Category created.");
      }

      setCategoryForm(null);
      await loadAll();
    } finally {
      setBusyId(null);
    }
  };

  const handleCategoryDelete = async () => {
    if (!detailCategory) return;

    setActionError("");
    setBusyId(getId(detailCategory));

    try {
      await deleteCategory(getId(detailCategory));
      setDetailCategory(null);
      setNotice("Category deleted.");
      await loadAll();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };

  // --- render -------------------------------------------------------------

  if (authLoading || loading) {
    return (
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin</h1>
        <div className="mt-6">
          <AdminSkeletons />
        </div>
      </section>
    );
  }

  if (accessDenied) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500">
          <icons.shield className="h-6 w-6" />
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Administrator access required
        </h1>

        <p className="mt-3 text-slate-600">
          This console is restricted to administrators. If you believe you should
          have access, ask another administrator to review your account role.
        </p>

        <button
          type="button"
          onClick={loadAll}
          className={buttonClass("secondary", "md", "mt-6")}
        >
          Try again
        </button>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        className="mx-auto max-w-2xl"
        title="Could not load the admin console."
        message={error}
        onRetry={loadAll}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Admin
          </h1>

          <p className="mt-2 text-slate-600">
            Platform overview, user and category management, and moderation
            oversight.
          </p>
        </div>

        <button
          type="button"
          onClick={loadAll}
          className={buttonClass("secondary", "sm")}
        >
          Refresh
        </button>
      </div>

      {notice ? (
        <Notice className="mt-6" onDismiss={() => setNotice("")}>
          {notice}
        </Notice>
      ) : null}

      {/* Tabs wrap rather than scroll horizontally. The previous
          `overflow-x-auto` row hid "Reports" and "Moderation log" off the right
          edge on a phone with no visible affordance that they were there. */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-current={tab === value ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === value
                ? "bg-blue-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab !== "overview" ? (
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            {SECTIONS[tab]}
          </h2>
        ) : null}

        {tab === "overview" ? (
          <AdminOverview stats={stats} />
        ) : tab === "users" ? (
          <AdminUsers
            users={users}
            currentUserId={currentUserId}
            busyId={busyId}
            onView={setDetailUserId}
            onRoleChange={requestRoleChange}
            onToggleActive={requestToggleActive}
          />
        ) : tab === "categories" ? (
          <AdminCategories
            categories={categories}
            busyId={busyId}
            onCreate={() => setCategoryForm({ mode: "create" })}
            onEdit={(category) => setCategoryForm({ mode: "edit", category })}
            onDelete={setDetailCategory}
          />
        ) : tab === "discussions" ? (
          <AdminDiscussions discussions={discussions} />
        ) : tab === "reports" ? (
          <AdminReports reports={reports} />
        ) : tab === "history" ? (
          <AdminModerationHistory actions={actions} />
        ) : (
          <EmptySection message="Unknown section." />
        )}
      </div>

      {dialog ? (
        <AdminConfirmDialog
          title={dialog.title}
          description={dialog.description}
          confirmLabel={dialog.confirmLabel}
          tone={dialog.tone}
          isBusy={Boolean(busyId)}
          error={actionError}
          onCancel={() => {
            setDialog(null);
            setActionError("");
          }}
          onConfirm={runUserAction}
        />
      ) : null}

      {detailUserId ? (
        <UserDetail userId={detailUserId} onClose={() => setDetailUserId(null)} />
      ) : null}

      {categoryForm ? (
        <CategoryFormDialog
          category={categoryForm.category ?? null}
          isSubmitting={busyId === "category"}
          onSubmit={handleCategorySubmit}
          onCancel={() => setCategoryForm(null)}
        />
      ) : null}

      {detailCategory ? (
        <CategoryDeleteDialog
          category={detailCategory}
          isDeleting={busyId === getId(detailCategory)}
          error={actionError}
          onCancel={() => {
            setDetailCategory(null);
            setActionError("");
          }}
          onConfirm={handleCategoryDelete}
        />
      ) : null}
    </section>
  );
};

export default Admin;
