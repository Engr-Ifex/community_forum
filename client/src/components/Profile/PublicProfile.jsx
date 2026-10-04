import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import users from "./UserData";

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [showReportForm, setShowReportForm] =
    useState(false);

  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const profileUser = users.find(
    (profile) =>
      profile.username.toLowerCase() ===
      username.toLowerCase(),
  );

  if (!profileUser) {
    return (
      <section>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-medium text-slate-700 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-semibold text-slate-900">
          Profile not found
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          The user profile you are looking for does not
          exist.
        </p>
      </section>
    );
  }

  const displayName =
    profileUser.name ||
    profileUser.username ||
    "User";

  const currentUsername =
    user?.username ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "";

  const isOwnProfile =
    isAuthenticated &&
    currentUsername.toLowerCase() ===
      profileUser.username.toLowerCase();

  const handleReportSubmit = (event) => {
    event.preventDefault();

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(
        "Please provide a reason for reporting this account.",
      );
      return;
    }

    const existingReports = JSON.parse(
      localStorage.getItem("forumReports") || "[]",
    );

    const newReport = {
      id:
        globalThis.crypto?.randomUUID?.() ??
        Date.now(),

      contentType: "account",

      contentId: profileUser.id,

      reportedUsername: profileUser.username,

      reportedName: profileUser.name,

      reason: trimmedReason,

      reporter:
        user?.username ||
        user?.name ||
        user?.email ||
        "Unknown user",

      reporterEmail: user?.email || null,

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
    setShowReportForm(false);
    setSuccess("Account report submitted successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  return (
    <section className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 text-sm font-medium text-slate-700 hover:underline"
      >
        ← Back
      </button>

      <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          {profileUser.profilePicture ? (
            <img
              src={profileUser.profilePicture}
              alt={`${displayName}'s profile`}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 text-3xl font-semibold text-slate-600"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              {displayName}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              @{profileUser.username}
            </p>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              {profileUser.bio || "No bio added yet."}
            </p>
          </div>
        </div>

        {isAuthenticated && !isOwnProfile && (
          <div className="mt-5 border-t border-slate-200 pt-5">
            {!showReportForm ? (
              <button
                type="button"
                onClick={() => {
                  setShowReportForm(true);
                  setError("");
                  setSuccess("");
                }}
                className="rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Report account
              </button>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Report @{profileUser.username}
                </h2>

                <form
                  onSubmit={handleReportSubmit}
                  className="mt-3 space-y-3"
                >
                  <label
                    htmlFor="account-report-reason"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Reason for report
                  </label>

                  <textarea
                    id="account-report-reason"
                    value={reason}
                    onChange={(event) =>
                      setReason(event.target.value)
                    }
                    placeholder="Explain why you are reporting this account..."
                    rows={4}
                    className="w-full resize-y rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                  />

                  {error && (
                    <p
                      role="alert"
                      className="text-sm text-red-700"
                    >
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
                        setShowReportForm(false);
                        setReason("");
                        setError("");
                      }}
                      className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
                className="mt-3 text-sm font-medium text-green-700"
              >
                {success}
              </p>
            )}
          </div>
        )}
      </header>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          About
        </h2>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-sm font-medium text-slate-500">
              Name
            </dt>

            <dd className="mt-1 text-sm text-slate-900">
              {profileUser.name || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Username
            </dt>

            <dd className="mt-1 text-sm text-slate-900">
              @{profileUser.username}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Pronouns
            </dt>

            <dd className="mt-1 text-sm text-slate-900">
              {profileUser.pronouns || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Gender
            </dt>

            <dd className="mt-1 text-sm text-slate-900">
              {profileUser.gender || "Not provided"}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-slate-500">
              Bio
            </dt>

            <dd className="mt-1 text-sm leading-6 text-slate-700">
              {profileUser.bio || "No bio added yet."}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Links
        </h2>

        {profileUser.links?.length > 0 ? (
          <ul className="mt-4 space-y-3">
            {profileUser.links.map((link, index) => (
              <li key={`${link.url}-${index}`}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-slate-700 hover:underline"
                >
                  {link.label || link.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No external links added yet.
          </p>
        )}
      </section>
    </section>
  );
};

export default PublicProfile;