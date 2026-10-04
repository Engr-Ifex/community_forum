import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ReportButton = ({
  contentType,
  contentId,
  discussionId,
}) => {
  const { isAuthenticated, user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please provide a reason for the report.");
      return;
    }

    const existingReports = JSON.parse(
      localStorage.getItem("forumReports") || "[]",
    );

    const newReport = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        Date.now(),
      contentType,
      contentId,
      discussionId: discussionId ?? null,
      reason: trimmedReason,
      reporter:
        user?.username ??
        user?.name ??
        user?.email ??
        "Unknown user",
      reporterEmail: user?.email ?? null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "forumReports",
      JSON.stringify([
        newReport,
        ...existingReports,
      ]),
    );

    setReason("");
    setError("");
    setShowForm(false);
    setSuccess("Report submitted successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  return (
    <div className="mt-2">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Report
        </button>
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Report this {contentType}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="mt-3 space-y-3"
          >
            <label
              htmlFor={`report-${contentType}-${contentId}`}
              className="block text-sm font-medium text-slate-700"
            >
              Reason
            </label>

            <textarea
              id={`report-${contentType}-${contentId}`}
              value={reason}
              onChange={(event) =>
                setReason(event.target.value)
              }
              placeholder="Explain why you are reporting this content..."
              rows={4}
              className="w-full resize-y rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            />

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Submit report
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setReason("");
                  setError("");
                }}
                className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {success && (
        <p
          role="status"
          className="mt-2 text-sm font-medium text-green-700"
        >
          {success}
        </p>
      )}
    </div>
  );
};

export default ReportButton;