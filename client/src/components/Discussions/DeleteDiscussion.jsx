import { useState } from "react";

function DeleteDiscussion({ discussionId, onDelete }) {
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
      <button type="button" onClick={handleDeleteClick}>
        Delete Discussion
      </button>

      {showConfirmation && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-discussion-title"
          aria-describedby="delete-discussion-description"
        >
          <h2 id="delete-discussion-title">Delete discussion?</h2>
          <p id="delete-discussion-description">
            Are you sure you want to delete this discussion? This action cannot be undone.
          </p>

          <button type="button" onClick={() => setShowConfirmation(false)}>
            Cancel
          </button>

          <button type="button" onClick={handleConfirmDelete}>
            Delete discussion
          </button>
        </div>
      )}
    </div>
  );
}

export default DeleteDiscussion