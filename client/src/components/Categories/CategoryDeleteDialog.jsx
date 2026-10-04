import { useEffect, useId } from "react";

import { buttonClass } from "../common/ui";

/**
 * Delete confirmation for a category.
 *
 * Follows the same accessible pattern as the discussion confirmation dialog:
 * `role="alertdialog"` + `aria-modal`, so assistive technology announces it as
 * a decision rather than a passive message.
 *
 * The warning is explicit about what the backend does NOT do: deleting a
 * category does not cascade, so discussions that referenced it are left
 * orphaned rather than removed.
 */
const CategoryDeleteDialog = ({
  category,
  onCancel,
  onConfirm,
  isDeleting = false,
  error = "",
}) => {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isDeleting) onCancel();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, isDeleting]);

  const name = category?.name ?? "this category";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isDeleting}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          Delete category?
        </h2>

        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-slate-600">
          <span className="font-medium capitalize text-slate-900">{name}</span> will
          be removed permanently. Discussions in this category are{" "}
          <span className="font-medium">not</span> deleted, but they will no longer
          appear under any category.
        </p>

        {error ? (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className={buttonClass("secondary", "md")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className={buttonClass("danger", "md")}
          >
            {isDeleting ? "Deleting..." : "Delete category"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CategoryDeleteDialog;
