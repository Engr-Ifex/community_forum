import { useEffect, useId, useRef } from "react";

import { buttonClass } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

/**
 * Confirmation dialog for an admin action that changes someone else's account.
 *
 * Deactivating a user and changing a user's role are both consequential and both
 * hard to undo silently, so each goes through an explicit confirmation rather
 * than firing straight from a select or a button. Follows the same accessible
 * pattern as the other dialogs (`role="alertdialog"`, Escape to cancel, busy
 * state disables both buttons).
 */
const AdminConfirmDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  isBusy = false,
  error = "",
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isBusy) onCancel();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isBusy]);

  // Both destructive and positive confirmations route through the shared design
  // system (red-700 / blue-600) rather than an ad-hoc palette, so an admin
  // dialog confirms in the same visual language as every other button.
  const confirmVariant = tone === "positive" ? "primary" : "danger";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
      onClick={() => {
        if (!isBusy) onCancel();
      }}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isBusy}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        <p id={descriptionId} className="mt-2 text-sm text-slate-600">
          {description}
        </p>

        {error ? (
          <div className="mt-4">
            <ErrorMessage message={error} />
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className={buttonClass("secondary", "md")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={buttonClass(confirmVariant, "md")}
          >
            {isBusy ? "Working..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminConfirmDialog;
