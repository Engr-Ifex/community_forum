import { useState } from "react";

function DeleteDiscussion({
  discussionId,
  onDelete,
  label = "Delete discussion",
  confirmationTitle = "Delete discussion?",
  confirmationMessage = "Are you sure you want to delete this discussion? This action cannot be undone.",
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(discussionId);
    setShowConfirmation(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleDeleteClick}
        className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        {label}
      </button>

      {showConfirmation && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirmation-title"
          aria-describedby="delete-confirmation-description"
          className="mt-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm"
        >
          <h2
            id="delete-confirmation-title"
            className="text-lg font-semibold text-slate-900"
          >
            {confirmationTitle}
          </h2>

          <p
            id="delete-confirmation-description"
            className="mt-2 text-sm leading-6 text-slate-600"
          >
            {confirmationMessage}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {label}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeleteDiscussion;