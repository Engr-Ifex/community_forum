import { useId } from "react";

function DeleteDiscussionConfirmation({
  onCancel,
  onConfirm,
  isDeleting = false,
  error = "",
}) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={isDeleting}
        className="w-full max-w-md rounded-md border border-slate-200 bg-white p-6 text-slate-800 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          Delete discussion?
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-slate-600">
          Are you sure you want to delete this discussion? This action cannot be undone.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete discussion"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeleteDiscussionConfirmation;
