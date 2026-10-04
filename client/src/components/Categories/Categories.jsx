import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categories";
import { buttonClass, EmptyState, ErrorState, icons, Notice, PageHeader, Skeleton } from "../common/ui";

import CategoryCard from "./CategoryCard";
import CategoryDeleteDialog from "./CategoryDeleteDialog";
import CategoryFormDialog from "./CategoryFormDialog";

const PlusIcon = icons.plus;

/** Placeholder tiles while the list is in flight. */
const CategorySkeletons = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-2/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Category index.
 *
 * Reads are public, so browsing works signed out. Every write control is
 * admin-only, and the dialog it opens calls the same admin endpoints the
 * backend already protects - hiding the buttons is a courtesy, not the
 * security boundary.
 */
const Categories = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === "admin";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Handed over after a delete from the detail page, mirroring Discussions.jsx.
  const [notice, setNotice] = useState(location.state?.notice ?? "");
  const [actionError, setActionError] = useState("");

  const [formState, setFormState] = useState(null); // { mode, category }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCategories();
      const list = response.data?.categories;

      setCategories(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (!location.state?.notice) return undefined;

    window.history.replaceState({}, "");

    const timer = window.setTimeout(() => setNotice(""), 6000);

    return () => window.clearTimeout(timer);
  }, [location.state]);

  const closeForm = () => {
    setFormState(null);
    setActionError("");
  };

  // The dialogs surface their own errors, so failures are re-thrown for them
  // to render while this component only handles the success path.
  const handleFormSubmit = async ({ name, description }) => {
    setIsSubmitting(true);

    try {
      if (formState?.mode === "edit") {
        await updateCategory(formState.category._id, {
          name,
          // Always send the description so clearing it is possible; the backend
          // refuses a PATCH with no recognised field at all.
          description,
        });

        closeForm();
        setNotice("Category updated.");
      } else {
        await createCategory({ name, description });

        closeForm();
        setNotice("Category created.");
      }

      await loadCategories();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setActionError("");

    try {
      await deleteCategory(deleteTarget._id);
      setDeleteTarget(null);
      setNotice("Category deleted.");
      await loadCategories();
    } catch (requestError) {
      // Keep the dialog open so the failure is visible where the action was.
      setActionError(requestError.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const adminActionsFor = (category) => (
    <>
      <button
        type="button"
        onClick={() => {
          setActionError("");
          setFormState({ mode: "edit", category });
        }}
        className="text-xs font-medium text-slate-600 transition hover:text-slate-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Edit
      </button>

      <button
        type="button"
        onClick={() => {
          setActionError("");
          setDeleteTarget(category);
        }}
        className="text-xs font-medium text-red-700 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        Delete
      </button>
    </>
  );

  return (
    <section>
      {formState ? (
        <CategoryFormDialog
          key={formState.category?._id ?? "create"}
          category={formState.mode === "edit" ? formState.category : null}
          isSubmitting={isSubmitting}
          onCancel={closeForm}
          onSubmit={handleFormSubmit}
        />
      ) : null}

      {deleteTarget ? (
        <CategoryDeleteDialog
          category={deleteTarget}
          isDeleting={isDeleting}
          error={actionError}
          onCancel={() => {
            setDeleteTarget(null);
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

      <PageHeader
        title="Categories"
        description="Browse discussions by category."
        className="mb-8"
      >
        {isAdmin && !loading && !error ? (
          <button
            type="button"
            onClick={() => {
              setActionError("");
              setFormState({ mode: "create", category: null });
            }}
            className={buttonClass("primary", "md", "shrink-0")}
          >
            <PlusIcon className="h-4 w-4" />
            New category
          </button>
        ) : null}
      </PageHeader>

      <div aria-live="polite">
        {loading ? <CategorySkeletons /> : null}

        {!loading && error ? (
          <ErrorState
            title="Could not load categories."
            message={error}
            onRetry={loadCategories}
          />
        ) : null}

        {!loading && !error && categories.length === 0 ? (
          <EmptyState
            icon={icons.grid}
            title="No categories yet"
            description={
              isAdmin
                ? "Create the first category to start organising discussions."
                : "Categories organise the forum into topics. Check back soon."
            }
          >
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setFormState({ mode: "create", category: null })}
                className={buttonClass("primary", "sm")}
              >
                <PlusIcon className="h-4 w-4" />
                Create category
              </button>
            ) : null}
          </EmptyState>
        ) : null}

        {!loading && !error && categories.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-slate-500">
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <li key={category._id} className="h-full">
                  <CategoryCard
                    category={category}
                    actions={isAdmin ? adminActionsFor(category) : null}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default Categories;
