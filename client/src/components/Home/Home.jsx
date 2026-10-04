import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../services/categories";
import { getDiscussions } from "../../services/discussions";
import { buttonClass, EmptyState, ErrorState, icons, Skeleton } from "../common/ui";
import CategoryTile from "./CategoryTile";
import FeatureHighlights from "./FeatureHighlights";
import FinalCta from "./FinalCta";
import Hero from "./Hero";
import RecentDiscussionCard from "./RecentDiscussionCard";

const RECENT_LIMIT = 6;
const CATEGORY_LIMIT = 8;

const ArrowIcon = icons.arrowRight;
const PlusIcon = icons.plus;

/** Placeholder rows while the recent-discussions request is in flight. */
const DiscussionSkeletons = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 3 }, (_, index) => (
      <div
        key={index}
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="mt-4 h-5 w-4/5" />
        <Skeleton className="mt-3 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
        <div className="mt-5 flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    ))}
  </div>
);

const CategorySkeletons = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 4 }, (_, index) => (
      <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/** Small heading row with an optional "view all" affordance. */
const SectionHeading = ({ title, description, to, linkLabel }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-2 text-slate-600">{description}</p>
      ) : null}
    </div>

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
 * Public landing page.
 *
 * Both sections below are fed by the real API - there is no local fixture data
 * on this page. The two requests run in parallel and are tracked separately, so
 * a failure in one does not blank out the other.
 */
const Home = () => {
  const { isAuthenticated } = useAuth();

  const [discussions, setDiscussions] = useState([]);
  const [categories, setCategories] = useState([]);

  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [discussionsError, setDiscussionsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  const loadDiscussions = useCallback(async () => {
    setDiscussionsLoading(true);
    setDiscussionsError("");

    try {
      const response = await getDiscussions({
        limit: RECENT_LIMIT,
        sort: "latest",
      });

      const list = response.data?.discussions;
      setDiscussions(Array.isArray(list) ? list : []);
    } catch (requestError) {
      setDiscussions([]);
      setDiscussionsError(requestError.message);
    } finally {
      setDiscussionsLoading(false);
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

  // `loadDiscussions` / `loadCategories` write their state after an `await`, so
  // nothing is set synchronously here - the rule flags the call site anyway,
  // matching the same advisory warning already present in Moderation/Admin.
  useEffect(() => {
    loadDiscussions();
    loadCategories();
  }, [loadDiscussions, loadCategories]);

  return (
    <>
      <Hero />

      <FeatureHighlights />

      {/* Recent discussions */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeading
          title="Recent discussions"
          description="What the community is talking about right now."
          to="/discussions"
          linkLabel="All discussions"
        />

        <div className="mt-8" aria-live="polite">
          {discussionsLoading ? <DiscussionSkeletons /> : null}

          {!discussionsLoading && discussionsError ? (
            <ErrorState
              title="We could not load discussions."
              message={discussionsError}
              onRetry={loadDiscussions}
            />
          ) : null}

          {!discussionsLoading && !discussionsError && discussions.length === 0 ? (
            <EmptyState
              icon={PlusIcon}
              title="No discussions yet"
              description="This forum is waiting for its first conversation. Be the one who starts it."
            >
              <Link
                to={isAuthenticated ? "/create-discussion" : "/register"}
                className={buttonClass("primary", "md")}
              >
                {isAuthenticated ? "Start a discussion" : "Join to start one"}
              </Link>
            </EmptyState>
          ) : null}

          {!discussionsLoading && !discussionsError && discussions.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {discussions.map((discussion) => (
                <RecentDiscussionCard
                  key={discussion._id ?? discussion.id}
                  discussion={discussion}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Popular categories */}
      <section className="border-y border-slate-200 bg-slate-50/70">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <SectionHeading
            title="Browse by category"
            description="Pick a topic and see where the conversation goes."
            to="/categories"
            linkLabel="All categories"
          />

          <div className="mt-8" aria-live="polite">
            {categoriesLoading ? <CategorySkeletons /> : null}

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
                description="Categories organise the forum into topics. An administrator can add the first ones."
              />
            ) : null}

            {!categoriesLoading && !categoriesError && categories.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, CATEGORY_LIMIT).map((category) => (
                  <CategoryTile
                    key={category._id ?? category.id}
                    category={category}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
};

export default Home;
