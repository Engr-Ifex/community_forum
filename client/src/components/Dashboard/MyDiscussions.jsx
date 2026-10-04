import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getUser } from "../../services/users";
import {
  buttonClass,
  CardSkeletonList,
  EmptyState,
  ErrorState,
  icons,
  PageHeader,
} from "../common/ui";

const PlusIcon = icons.plus;
const ChatIcon = icons.chat;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

/**
 * The signed-in user's own discussions.
 *
 * Backed entirely by the existing `GET /users/:id` endpoint, which already
 * returns `{ user, discussions, replies }` - there is no author-filtered
 * discussions endpoint and this page deliberately does not require one. The
 * sidebar item therefore maps onto a real API rather than an invented one.
 */
const MyDiscussions = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const authUserId = authUser?._id ?? authUser?.id;

  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
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
        const response = await getUser(authUserId);
        const list = response.data?.discussions;

        if (!ignoreResponse) {
          setDiscussions(Array.isArray(list) ? list : []);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setDiscussions([]);
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

  return (
    <section>
      <PageHeader
        title="My Discussions"
        description="Every conversation you have started."
      >
        <Link to="/create-discussion" className={buttonClass("primary", "md")}>
          <PlusIcon className="h-4 w-4" />
          New discussion
        </Link>
      </PageHeader>

      <div className="mt-6" aria-live="polite">
        {authLoading || loading ? <CardSkeletonList count={3} lines={2} /> : null}

        {!authLoading && !loading && error ? (
          <ErrorState
            title="Could not load your discussions."
            message={error}
            onRetry={reload}
          />
        ) : null}

        {!authLoading && !loading && !error && discussions.length === 0 ? (
          <EmptyState
            icon={ChatIcon}
            title="You have not started any discussions yet"
            description="Ask a question or share something the community would find useful."
          >
            <Link to="/create-discussion" className={buttonClass("primary", "md")}>
              <PlusIcon className="h-4 w-4" />
              Start a discussion
            </Link>
          </EmptyState>
        ) : null}

        {!authLoading && !loading && !error && discussions.length > 0 ? (
          <ul className="space-y-3">
            {discussions.map((discussion) => {
              const id = discussion._id ?? discussion.id;

              return (
                <li key={id}>
                  <Link
                    to={`/discussions/${id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <p className="min-w-0 font-semibold text-slate-900">
                        {discussion.title ?? "Untitled discussion"}
                      </p>

                      {discussion.status && discussion.status !== "active" ? (
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium capitalize text-amber-700">
                          {discussion.status}
                        </span>
                      ) : null}
                    </div>

                    {discussion.content ? (
                      <p className="mt-1.5 line-clamp-2 text-sm text-slate-600">
                        {discussion.content}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      {formatDate(discussion.createdAt) ? (
                        <span>{formatDate(discussion.createdAt)}</span>
                      ) : null}

                      {discussion.views !== undefined ? (
                        <span className="inline-flex items-center gap-1">
                          <icons.eye className="h-3.5 w-3.5 text-slate-400" />
                          {discussion.views}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default MyDiscussions;
