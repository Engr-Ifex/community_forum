import { useEffect, useState } from "react";

import { fetchHealth } from "../../services/api";

/**
 * Frontend <-> backend connectivity check.
 *
 * Calls GET /api/v1/health through the shared Axios instance and renders the
 * message returned by the API, proving the two halves of the project talk to
 * each other. It is a foundation diagnostic, not a feature.
 */
const STATUS_STYLES = {
  loading: "border-slate-200 bg-slate-50 text-slate-600",
  online: "border-emerald-200 bg-emerald-50 text-emerald-800",
  offline: "border-red-200 bg-red-50 text-red-800",
};

const BackendStatus = () => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: "loading", message: "Checking..." });

  useEffect(() => {
    let cancelled = false;

    fetchHealth()
      .then((response) => {
        if (!cancelled) {
          setState({ status: "online", message: response.message });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({ status: "offline", message: error.message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: "loading", message: "Checking..." });
    setAttempt((value) => value + 1);
  };

  return (
    <div
      role="status"
      className={`flex flex-wrap items-center justify-center gap-3 rounded-lg border px-4 py-3 text-sm ${STATUS_STYLES[state.status]}`}
    >
      <span>
        <span className="font-medium">Backend Status:</span> {state.message}
      </span>

      {state.status !== "loading" ? (
        <button
          type="button"
          onClick={retry}
          className="rounded-md border border-current px-2 py-1 text-xs font-medium hover:opacity-80"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
};

export default BackendStatus;
