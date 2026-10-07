import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getUser, updateUser } from "../../services/users";
import { buttonClass, ErrorState, icons, Notice, Skeleton } from "../common/ui";

import Avatar from "./Avatar";
import ProfileEditForm from "./ProfileEditForm";

const ChatIcon = icons.chat;
const PlusIcon = icons.plus;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

const ProfileSkeletons = () => (
  <div className="space-y-8">
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start gap-5">
        <Skeleton className="h-20 w-20 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-3 h-4 w-56" />
          <Skeleton className="mt-4 h-4 w-full max-w-md" />
        </div>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 2 }, (_, column) => (
        <div key={column}>
          <Skeleton className="h-6 w-40" />
          <div className="mt-3 space-y-3">
            {Array.from({ length: 3 }, (_, row) => (
              <div key={row} className="rounded-lg border border-slate-200 bg-white p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-32" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * The signed-in user's own profile.
 *
 * Reads come from `GET /users/:id` using the id from AuthContext - that
 * endpoint returns the user plus their discussions and replies in one call.
 *
 * Two details the API dictates:
 * - the profile payload does NOT include `role` (the service selects a public
 *   field list), so the role badge is read from AuthContext, which gets it from
 *   `/auth/me`;
 * - the activity lists carry raw author/category/discussion ids rather than
 *   populated documents, so the lists render what is actually returned instead
 *   of inventing a second round of fetches.
 */
const Profile = () => {
  const { user: authUser, loading: authLoading, refreshUser } = useAuth();

  // Mongoose serialises the key as `_id`; `id` is only a fallback.
  const authUserId = authUser?._id ?? authUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");

  // Bumping this re-runs the load effect, which the retry button and the
  // post-save refresh both need. Keeping one code path means the two can never
  // drift apart.
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    // Wait for AuthContext to resolve before deciding there is no user, or a
    // refresh would briefly render the signed-out state.
    if (authLoading) return undefined;

    if (!authUserId) {
      setLoading(false);
      return undefined;
    }

    let ignoreResponse = false;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // GET /users/:id returns { user, discussions, replies }.
        const response = await getUser(authUserId);

        if (!ignoreResponse) {
          setProfile(response.data ?? null);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setError(requestError.message);
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      ignoreResponse = true;
    };
  }, [authUserId, authLoading, reloadToken]);

  useEffect(() => {
    if (!notice) return undefined;

    const timer = window.setTimeout(() => setNotice(""), 6000);

    return () => window.clearTimeout(timer);
  }, [notice]);

  /**
   * Saves through PATCH /users/:id, then refreshes AuthContext so the navbar
   * and every other consumer pick up the new name/avatar immediately.
   */
  const handleSave = async (updates) => {
    setIsSaving(true);

    try {
      await updateUser(authUserId, updates);

      // refreshUser re-reads /auth/me, so the whole app sees the change.
      await refreshUser();

      setIsEditing(false);
      setNotice("Your profile has been updated.");
      reload();
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section>
        <ProfileSkeletons />
      </section>
    );
  }

  if (!authUser) {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          You are not signed in
        </h1>

        <p className="mt-3 text-slate-600">
          Sign in to view and edit your profile.
        </p>

        <Link to="/login" className={buttonClass("primary", "md", "mt-6")}>
          Log in
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <ErrorState
        className="mx-auto max-w-2xl"
        title="Could not load your profile."
        message={error}
        onRetry={reload}
      />
    );
  }

  const profileUser = profile?.user ?? authUser;
  const discussions = profile?.discussions ?? [];
  const replies = profile?.replies ?? [];

  // The profile payload omits role, so it comes from the session instead.
  const role = authUser?.role ?? "user";

  if (isEditing) {
    return (
      <section className="mx-auto max-w-3xl">
        {notice ? <Notice className="mb-6">{notice}</Notice> : null}

        <ProfileEditForm
          user={profileUser}
          isSaving={isSaving}
          onSubmit={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {notice ? (
        <Notice onDismiss={() => setNotice("")}>{notice}</Notice>
      ) : null}

      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-5">
            <Avatar user={profileUser} />

            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
                {profileUser?.name ?? "Profile"}
              </h1>

              {profileUser?.email ? (
                <p className="mt-1 truncate text-slate-600">{profileUser.email}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium capitalize text-slate-700">
                  {role}
                </span>

                {profileUser?.createdAt ? (
                  <span className="text-slate-500">
                    Joined {formatDate(profileUser.createdAt)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={buttonClass("secondary", "sm", "shrink-0")}
          >
            Edit profile
          </button>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-5">
          {profileUser?.bio ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">
              {profileUser.bio}
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              You have not added a bio yet.{" "}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Add one
              </button>
              .
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Your discussions
              <span className="ml-2 text-sm font-normal text-slate-500">
                {discussions.length}
              </span>
            </h2>

            <Link to="/create-discussion" className={buttonClass("ghost", "sm")}>
              <PlusIcon className="h-4 w-4" />
              New
            </Link>
          </div>

          {discussions.length > 0 ? (
            <ul className="space-y-3">
              {discussions.map((discussion) => (
                <li key={discussion._id}>
                  <Link
                    to={`/discussions/${discussion._id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    <p className="font-medium text-slate-900">
                      {discussion.title ?? "Untitled discussion"}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      {formatDate(discussion.createdAt) ? (
                        <span>{formatDate(discussion.createdAt)}</span>
                      ) : null}

                      {discussion.views !== undefined ? (
                        <span className="inline-flex items-center gap-1">
                          <icons.eye className="h-3.5 w-3.5 text-slate-400" />
                          {discussion.views}
                        </span>
                      ) : null}

                      {discussion.status && discussion.status !== "active" ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium capitalize text-amber-700">
                          {discussion.status}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm text-slate-600">
                You have not started any discussions yet.
              </p>

              <Link
                to="/create-discussion"
                className={buttonClass("primary", "sm", "mt-4")}
              >
                <PlusIcon className="h-4 w-4" />
                Start a discussion
              </Link>
            </div>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Your replies
              <span className="ml-2 text-sm font-normal text-slate-500">
                {replies.length}
              </span>
            </h2>
          </div>

          {replies.length > 0 ? (
            <ul className="space-y-3">
              {replies.map((reply) => (
                <li
                  key={reply._id}
                  className="rounded-lg border border-slate-200 bg-white p-4"
                >
                  <p className="line-clamp-3 whitespace-pre-wrap break-words text-slate-700">
                    {reply.content ?? "(empty reply)"}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                    {formatDate(reply.createdAt) ? (
                      <span>{formatDate(reply.createdAt)}</span>
                    ) : null}

                    {reply.status === "removed" ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        removed
                      </span>
                    ) : null}

                    {/* The replies payload carries only the discussion id, not a
                        title, so the link goes to the thread rather than
                        guessing a name for it. */}
                    {reply.discussion ? (
                      <Link
                        to={`/discussions/${reply.discussion}`}
                        className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        <ChatIcon className="h-3.5 w-3.5" />
                        View thread
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center">
              <span
                aria-hidden="true"
                className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400"
              >
                <ChatIcon className="h-5 w-5" />
              </span>

              <p className="mt-3 text-sm text-slate-600">
                You have not posted any replies yet.
              </p>

              <Link to="/discussions" className={buttonClass("secondary", "sm", "mt-4")}>
                Browse discussions
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Profile;
