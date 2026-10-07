import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { deleteCategory, getCategory, updateCategory } from "../../services/categories";
import { getDiscussions } from "../../services/discussions";
import {
  buttonClass,
  EmptyState,
  ErrorState,
  icons,
  Notice,
  Skeleton,
} from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

import CategoryDeleteDialog from "./CategoryDeleteDialog";
import CategoryFormDialog from "./CategoryFormDialog";
import DiscussionCard from "../Discussions/DiscussionCard";

const PlusIcon = icons.plus;

const DiscussionSkeletons = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }, (_, index) => (
      <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-28 rounded-full" />
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    ))}
  </div>
);

/**
 * One category and the discussions inside it.
 *
 * The category is fetched by id rather than read from the index's state, so a
 * direct link or a refresh works on its own. Discussions come from the same
 * public endpoint the rest of the app uses, filtered by category id - the
 * backend does the filtering, we never sort through a full list client-side.
 */
const CategoryPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin";

  const [category, setCategory] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let ignoreResponse = false;

    const load = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        // The category drives the page, so a bad id fails fast; the discussions
        // request runs alongside it because it is independent.
        const [categoryResponse, discussionResponse] = await Promise.all([
          getCategory(id),
          getDiscussions({ category: id, limit: 20, sort: "latest" }),
        ]);

        if (ignoreResponse) return;

        setCategory(categoryResponse.data?.category ?? null);

        const list = discussionResponse.data?.discussions;
        setDiscussions(Array.isArray(list) ? list : []);
        setPagination(discussionResponse.data?.pagination ?? null);
      } catch (requestError) {
        if (ignoreResponse) return;

        if (requestError.status === 404) {
          setNotFound(true);
        } else {
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
  }, [id, reloadToken]);

  const retry = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  // Editing returns to the read view and re-fetches so the header reflects the
  // saved values rather than holding a second copy of them.
  const handleEditSubmit = async ({ name, description }) => {
    await updateCategory(id, { name, description });

    setIsEditing(false);
    setNotice("Category updated.");
    retry();
  };

  // The category deletion lives here (not in a service) because the page owns
  // the navigation that follows it.
  const handleDelete = async () => {
    setActionError("");
    setIsDeleting(true);

    try {
      await deleteCategory(id);
    } catch (requestError) {
      setActionError(requestError.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <Skeleton className="h-4 w-40" />

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        </div>

        <div className="mt-8 space-y-4">
          <Skeleton className="h-6 w-32" />
          <DiscussionSkeletons />
        </div>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          404
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Category not found
        </h1>

        <p className="mt-3 text-slate-600">
          This category does not exist, or it was removed by an administrator.
        </p>

        <Link to="/categories" className={buttonClass("primary", "md", "mt-6")}>
          Back to categories
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mx-auto max-w-2xl">
        <ErrorState
          title="Could not load this category."
          message={error}
          onRetry={retry}
        >
          <Link
            to="/categories"
            className="text-sm font-medium text-slate-700 underline hover:text-slate-900"
          >
            Back to categories
          </Link>
        </ErrorState>
      </section>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-3xl">
        {actionError ? <ErrorMessage message={actionError} /> : null}

        <div className="mt-4">
          <CategoryFormDialog
            key={category?._id}
            category={category}
            isSubmitting={false}
            onCancel={() => {
              setIsEditing(false);
              setActionError("");
            }}
            onSubmit={handleEditSubmit}
          />
        </div>
      </div>
    );
  }

  return (
    <section>
      {showDeleteConfirm ? (
        <CategoryDeleteDialog
          category={category}
          isDeleting={isDeleting}
          error={actionError}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setActionError("");
          }}
          onConfirm={handleDelete}
        />
      ) : null}

      {notice ? (
        <Notice className="mb-6" onDismiss={() => setNotice("")}>
          {notice}
        </Notice>
      ) : null}

      <Link
        to="/categories"
        className="mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        ← Back to categories
      </Link>

      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold capitalize tracking-tight text-slate-900">
              {category?.name ?? "Category"}
            </h1>

            {category?.description ? (
              <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">
                {category.description}
              </p>
            ) : (
              <p className="mt-2 text-slate-500">
                No description has been added for this category.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Admin controls are only rendered for admins; the endpoints
                enforce this independently. */}
            {isAdmin && !authLoading ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={buttonClass("secondary", "sm")}
                >
                  Edit category
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className={buttonClass(
                    "secondary",
                    "sm",
                    "border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50",
                  )}
                >
                  Delete
                </button>
              </>
            ) : null}
          </div>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          {discussions.length}{" "}
          {discussions.length === 1 ? "discussion" : "discussions"}
          {pagination?.totalItems !== undefined &&
          pagination.totalItems !== discussions.length
            ? ` of ${pagination.totalItems}`
            : ""}
        </p>
      </header>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Discussions</h2>

          <Link
            to="/create-discussion"
            className={buttonClass("ghost", "sm")}
          >
            <PlusIcon className="h-4 w-4" />
            Start a discussion
          </Link>
        </div>

        <div aria-live="polite">
          {discussions.length > 0 ? (
            <ul className="space-y-4">
              {discussions.map((discussion) => (
                <li key={discussion._id}>
                  <DiscussionCard discussion={discussion} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={icons.chat}
              title="No discussions here yet"
              description="Nothing has been posted in this category. Be the first to start the conversation."
            >
              <Link to="/create-discussion" className={buttonClass("primary", "sm")}>
                <PlusIcon className="h-4 w-4" />
                Start a discussion
              </Link>
            </EmptyState>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryPage;
