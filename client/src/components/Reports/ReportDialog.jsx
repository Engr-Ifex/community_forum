import { useEffect, useId, useRef, useState } from "react";

import { createReport } from "../../services/reports";
import { getFieldErrors } from "../../services/auth";
import { buttonClass, icons } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

const FlagIcon = icons.flag;
const CheckIcon = icons.check;

/**
 * Report dialog for a discussion or a reply.
 *
 * Exactly one of `discussionId` / `replyId` must be supplied - the backend
 * validates the same rule (`createReportSchema` requires one and only one) and
 * rejects anything else with a 400.
 *
 * Duplicate protection is deliberately two-layered:
 *  - the UI guards the obvious cases (button disabled while a request is in
 *    flight, dialog closed on success, a friendly message instead of the raw
 *    409). This stops accidental double submissions.
 *  - the backend remains the authority: it rejects a second *pending* report
 *    from the same user on the same content with 409, and that response is
 *    surfaced honestly rather than hidden.
 */
const ReportDialog = ({
  discussionId = null,
  replyId = null,
  onClose,
  onSubmitted,
}) => {
  const titleId = useId();
  const reasonId = useId();
  const reasonErrorId = useId();
  const closeButtonRef = useRef(null);

  const [reason, setReason] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const target = discussionId ? "discussion" : "reply";

  // Focus the close button on open and close on Escape - except mid-request,
  // where dismissing would hide an outcome the user needs to see.
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, isSubmitting]);

  const validate = () => {
    const trimmed = reason.trim();

    if (trimmed.length < 3) {
      return { reason: "Please describe the problem in at least 3 characters." };
    }

    if (trimmed.length > 1000) {
      return { reason: "Please keep the reason under 1000 characters." };
    }

    return {};
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    setFormError("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Exactly one target key is sent, matching the backend's XOR refine.
      const payload = discussionId
        ? { discussion: discussionId, reason: reason.trim() }
        : { reply: replyId, reason: reason.trim() };

      await createReport(payload);

      setDone(true);
      onSubmitted?.();
    } catch (requestError) {
      // A duplicate pending report is a normal, explainable outcome - not a
      // crash. Say so plainly and leave the dialog open only if it is useful.
      if (requestError.status === 409) {
        setFormError(
          requestError.message ||
            "You have already reported this content. A moderator will review it.",
        );
        setDone(true);
      } else {
        const backendFieldErrors = getFieldErrors(requestError);

        if (Object.keys(backendFieldErrors).length > 0) {
          setFieldErrors(backendFieldErrors);
        } else {
          setFormError(requestError.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
              <FlagIcon className="h-5 w-5" />
            </span>

            <div>
              <h2 id={titleId} className="text-lg font-semibold text-slate-900">
                {done ? "Report submitted" : `Report this ${target}`}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {done
                  ? "Thanks - a moderator will review your report."
                  : "Tell a moderator what is wrong. Reports are reviewed by the moderation team."}
              </p>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close report dialog"
            className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <icons.close className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="mt-6">
            {formError ? (
              <div
                role="status"
                className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
              >
                <span>{formError}</span>
              </div>
            ) : (
              <div
                role="status"
                className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <CheckIcon className="h-5 w-5 shrink-0" />
                <span>Your report is in the moderation queue.</span>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={buttonClass("primary", "md")}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6">
            <label htmlFor={reasonId} className="block text-sm font-medium text-slate-700">
              Reason
            </label>

            <textarea
              id={reasonId}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (fieldErrors.reason) {
                  setFieldErrors((current) => ({ ...current, reason: "" }));
                }
              }}
              rows={4}
              maxLength={1000}
              placeholder="e.g. This post is spam / harassment / off-topic."
              aria-invalid={Boolean(fieldErrors.reason)}
              aria-describedby={fieldErrors.reason ? reasonErrorId : undefined}
              className={`mt-1.5 w-full resize-y rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
                fieldErrors.reason
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
              }`}
            />

            <div className="mt-1.5 flex items-center justify-between">
              {fieldErrors.reason ? (
                <p id={reasonErrorId} className="text-sm text-red-700">
                  {fieldErrors.reason}
                </p>
              ) : (
                <span className="text-xs text-slate-500">
                  Minimum 3 characters.
                </span>
              )}

              <span className="text-xs text-slate-500">{reason.length}/1000</span>
            </div>

            {formError ? (
              <div className="mt-4">
                <ErrorMessage message={formError} />
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className={buttonClass("secondary", "md")}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={buttonClass("primary", "md")}
              >
                {isSubmitting ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
