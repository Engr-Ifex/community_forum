import { useEffect, useId, useRef, useState } from "react";

import { getFieldErrors } from "../../services/auth";
import { buttonClass, labelClass, textareaClass } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

/**
 * Confirmation dialog for a moderation action.
 *
 * The backend's `moderationReasonSchema` makes `reason` **optional**, so this is
 * not a hard requirement - but a moderation queue whose audit log is empty is
 * not much of an audit log, so the dialog invites one and explains that it is
 * optional. The reason is trimmed and sent as-is; the backend caps it at 1000.
 *
 * Used for: locking a discussion, removing a discussion/reply, and for
 * resolving/dismissing a report.
 */
const ModerationActionDialog = ({
  title,
  description,
  confirmLabel = "Confirm",
  tone = "neutral",
  requireReason = false,
  reasonLabel = "Reason (optional)",
  busyLabel = "Working...",
  isBusy = false,
  error = "",
  onCancel,
  onConfirm,
}) => {
  const titleId = useId();
  const reasonId = useId();
  const reasonErrorId = useId();
  const cancelRef = useRef(null);

  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isBusy) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isBusy]);

  const handleConfirm = () => {
    const trimmed = reason.trim();

    if (requireReason && trimmed.length < 3) {
      setLocalError("Please give a reason of at least 3 characters.");
      return;
    }

    if (trimmed.length > 1000) {
      setLocalError("Please keep the reason under 1000 characters.");
      return;
    }

    setLocalError("");
    onConfirm(trimmed);
  };

  // A positive moderation outcome (dismiss/resolve) reads as the primary blue
  // action; a destructive one (remove/lock) uses the shared red danger variant.
  const confirmVariant =
    tone === "danger" ? "danger" : tone === "positive" ? "primary" : "secondary";

  const shownError = localError || (error ? getFieldErrors(error)?.reason || error : "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={() => {
        if (!isBusy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        ) : null}

        <div className="mt-5">
          <label htmlFor={reasonId} className={labelClass}>
            {reasonLabel}
          </label>

          <textarea
            id={reasonId}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              if (localError) setLocalError("");
            }}
            rows={3}
            maxLength={1000}
            placeholder="Add a short note for the moderation log."
            aria-invalid={Boolean(localError)}
            aria-describedby={localError ? reasonErrorId : undefined}
            className={textareaClass(Boolean(localError), "mt-1.5")}
          />

          <div className="mt-1.5 flex items-center justify-between">
            {localError ? (
              <p id={reasonErrorId} className="text-sm text-red-700">
                {localError}
              </p>
            ) : (
              <span className="text-xs text-slate-500">
                {requireReason ? "Required." : "Optional, but recommended."}
              </span>
            )}

            <span className="text-xs text-slate-500">{reason.length}/1000</span>
          </div>
        </div>

        {shownError ? (
          <div className="mt-4">
            <ErrorMessage message={shownError} />
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
            onClick={handleConfirm}
            disabled={isBusy}
            className={buttonClass(confirmVariant, "md")}
          >
            {isBusy ? busyLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationActionDialog;
