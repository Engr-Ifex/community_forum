import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Moderation = () => {
  const { user } = useAuth();

  const [reports, setReports] = useState([]);

  const loadReports = () => {
    const savedReports = JSON.parse(
      localStorage.getItem("forumReports") || "[]",
    );

    setReports(savedReports);
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Only moderators and administrators can access moderation.
  if (
    user?.role !== "moderator" &&
    user?.role !== "admin"
  ) {
    return (
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">
          Access denied
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Only moderators and administrators can access
          moderation tools.
        </p>
      </section>
    );
  }

  const handleMarkReviewed = (reportId) => {
    const updatedReports = reports.map((report) =>
      String(report.id) === String(reportId)
        ? {
            ...report,
            status: "reviewed",
          }
        : report,
    );

    setReports(updatedReports);

    localStorage.setItem(
      "forumReports",
      JSON.stringify(updatedReports),
    );
  };

  const handleDeleteReport = (reportId) => {
    const updatedReports = reports.filter(
      (report) =>
        String(report.id) !== String(reportId),
    );

    setReports(updatedReports);

    localStorage.setItem(
      "forumReports",
      JSON.stringify(updatedReports),
    );
  };

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : "Moderator";

  return (
    <section>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Moderation
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {roleLabel} tools for reviewing reported content.
        </p>
      </header>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">
          Your permissions
        </h2>

        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>✓ Review user reports</li>
          <li>✓ Remove inappropriate discussions</li>
          <li>✓ Remove inappropriate replies</li>

          {user?.role === "admin" && (
            <li>✓ Manage forum categories</li>
          )}
        </ul>
      </div>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Reports ({reports.length})
          </h2>

          <button
            type="button"
            onClick={loadReports}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh reports
          </button>
        </div>

        {reports.length === 0 ? (
          <p className="mt-4 rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No reports have been submitted.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {reports.map((report) => {
              const parsedDate = new Date(
                report.createdAt,
              );

              const displayDate =
                !Number.isNaN(parsedDate.getTime())
                  ? parsedDate.toLocaleString()
                  : report.createdAt;

              return (
                <article
                  key={report.id}
                  className="rounded-lg border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Reported {report.contentType}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Reported by {report.reporter}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {displayDate}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        report.status === "reviewed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-md bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-700">
                      Reason
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {report.reason}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.status !== "reviewed" && (
                      <button
                        type="button"
                        onClick={() =>
                          handleMarkReviewed(report.id)
                        }
                        className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                      >
                        Mark as reviewed
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteReport(report.id)
                      }
                      className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Remove report
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};

export default Moderation;