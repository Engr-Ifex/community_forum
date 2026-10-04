import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../services/categories";
import { getDiscussions } from "../../services/discussions";
import { getUser } from "../../services/users";
import { getPreferredName } from "../../utils/name";
import {
  buttonClass,
  cardClass,
  EmptyState,
  ErrorState,
  icons,
  Skeleton,
} from "../common/ui";
import CategoryTile from "../Home/CategoryTile";
import RecentDiscussionCard from "../Home/RecentDiscussionCard";

const RECENT_LIMIT = 4;
const CATEGORY_LIMIT = 6;

const PlusIcon = icons.plus;
const ChatIcon = icons.chat;
const ArrowIcon = icons.arrowRight;

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

/** A single counter tile in the personal summary row. */
const StatCard = ({ label, value, loading, hint }) => (
  <div className={cardClass("p-5")}>
    <p className="text-sm font-medium text-slate-500">{label}</p>

    {loading ? (
      <Skeleton className="mt-3 h-8 w-14" />
    ) : (
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    )}

    {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
  </div>
);

/** Section heading with an optional "view all" link, matching the Home page. */
const SectionHeading = ({ title, to, linkLabel }) => (
  <div className="flex items-end justify-between gap-3">
    <h2 className="text-xl font-semibold text-slate-900">{title}</h2>

    {to ? (
      <Link
        to={to}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-blue-700 transition hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        {linkLabel}
        <ArrowIcon className="h-4 w-4" />
      </Link>
    ) : null}
  </div>
);

/**
 * The authenticated landing surface.
 *
 * Every panel is driven by a real endpoint - nothing here is fixture data:
 *   - the welcome greeting and stat tiles come from the session plus
 *     `GET /users/:id`, which already returns the user's discussions and replies;
 *   - recent activity comes from `GET /discussions`;
 *   - categories come from `GET /categories`.
 *
 * Each request is tracked separately, so a failure in one panel leaves the
 * others usable instead of blanking the whole page.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const userId = user?._id ?? user?.id;

  const [recent, setRecent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activity, setActivity] = useState(null);

  const [recentLoading, setRecentLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  const [recentError, setRecentError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [activityError, setActivityError] = useState("");

  const loadRecent = useCallback(async () => {
    setRecentLoading(true);
    setRecentError("");

    try {
      const response = await getDiscussions({ limit: RECENT_LIMIT, sort: "latest" });
      const list = response.data?.discussions;

      setRecent(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setRecent([]);
      setRecentError(requestError.message);
    } finally {
      setRecentLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const response = await getCategories();
      const list = response.data?.categories;

      setCategories(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setCategories([]);
      setCategoriesError(requestError.message);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadActivity = useCallback(async () => {
    if (!userId) {
      setActivityLoading(false);
      return;
    }

    setActivityLoading(true);
    setActivityError("");

    try {
      // GET /users/:id returns { user, discussions, replies } for this user.
      const response = await getUser(userId);
      const data = response.data ?? null;

      setActivity({
        discussions: Array.isArray(data?.discussions) ? data.discussions : [],
        replies: Array.isArray(data?.replies) ? data.replies : [],
      });
    } catch (requestError) {
      setActivity(null);
      setActivityError(requestError.message);
    } finally {
      setActivityLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecent();
    loadCategories();
    loadActivity();
  }, [loadRecent, loadCategories, loadActivity]);

  const discussionCount = activity?.discussions?.length ?? 0;
  const replyCount = activity?.replies?.length ?? 0;

  // The most recent discussion the user started, if any - shown as a
  // "pick up where you left off" affordance.
  const latestOwnDiscussion = activity?.discussions?.[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700">
              {formatDate(new Date().toISOString())}
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {getPreferredName(user)}
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              Here is what is happening in the community, plus quick access to
              the conversations you are part of.
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to="/create-discussion" className={buttonClass("primary", "md")}>
              <PlusIcon className="h-4 w-4" />
              Start a discussion
            </Link>

            <Link to="/discussions" className={buttonClass("secondary", "md")}>
              Browse discussions
            </Link>
          </div>
        </div>
      </section>

      {/* Personal summary */}
      <section>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your activity
        </p>

        {activityError ? (
          <ErrorState
            title="Could not load your activity."
            message={activityError}
            onRetry={loadActivity}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Discussions started"
              value={discussionCount}
              loading={activityLoading}
            />

            <StatCard
              label="Replies posted"
              value={replyCount}
              loading={activityLoading}
            />

            <StatCard
              label="Your latest discussion"
              value={
                latestOwnDiscussion
                  ? formatDate(latestOwnDiscussion.createdAt) || "—"
                  : "—"
              }
              loading={activityLoading}
              hint={
                latestOwnDiscussion
                  ? latestOwnDiscussion.title
                  : "You have not started one yet"
              }
            />
          </div>
        )}
      </section>

      {/* Recent discussions */}
      <section>
        <SectionHeading
          title="Recent discussions"
          to="/discussions"
          linkLabel="All discussions"
        />

        <div className="mt-4" aria-live="polite">
          {recentLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }, (_, index) => (
                <div key={index} className={cardClass("p-5")}>
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="mt-4 h-5 w-4/5" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          ) : null}

          {!recentLoading && recentError ? (
            <ErrorState
              title="We could not load discussions."
              message={recentError}
              onRetry={loadRecent}
            />
          ) : null}

          {!recentLoading && !recentError && recent.length === 0 ? (
            <EmptyState
              icon={PlusIcon}
              title="No discussions yet"
              description="Be the one who starts the first conversation."
            >
              <Link to="/create-discussion" className={buttonClass("primary", "md")}>
                Start a discussion
              </Link>
            </EmptyState>
          ) : null}

          {!recentLoading && !recentError && recent.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((discussion) => (
                <RecentDiscussionCard
                  key={discussion._id ?? discussion.id}
                  discussion={discussion}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Categories */}
      <section>
        <SectionHeading
          title="Browse by category"
          to="/categories"
          linkLabel="All categories"
        />

        <div className="mt-4" aria-live="polite">
          {categoriesLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={cardClass("p-5")}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-3 w-full" />
                </div>
              ))}
            </div>
          ) : null}

          {!categoriesLoading && categoriesError ? (
            <ErrorState
              title="We could not load categories."
              message={categoriesError}
              onRetry={loadCategories}
            />
          ) : null}

          {!categoriesLoading && !categoriesError && categories.length === 0 ? (
            <EmptyState
              icon={icons.grid}
              title="No categories yet"
              description="An administrator can add the first categories."
            />
          ) : null}

          {!categoriesLoading && !categoriesError && categories.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, CATEGORY_LIMIT).map((category) => (
                <CategoryTile
                  key={category._id ?? category.id}
                  category={category}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Quick links */}
      <section className={cardClass("p-6")}>
        <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Link
            to="/my-discussions"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <ChatIcon className="h-4 w-4 shrink-0 text-slate-400" />
            My discussions
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <icons.users className="h-4 w-4 shrink-0 text-slate-400" />
            Your profile
          </Link>

          <Link
            to="/categories"
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <icons.grid className="h-4 w-4 shrink-0 text-slate-400" />
            Browse categories
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
