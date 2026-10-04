import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { getCategories } from "../../services/categories";
import { getDiscussions } from "../../services/discussions";
import {
  buttonClass,
  CardSkeletonList,
  EmptyState,
  ErrorState,
  icons,
  inputClass,
  labelClass,
  Notice,
  PageHeader,
  selectClass,
} from "../common/ui";
import DiscussionCard from "./DiscussionCard";

const PlusIcon = icons.plus;
const ChatIcon = icons.chat;

const Discussions = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [fromCategory, setFromCategory] = useState(
    location.state?.fromCategory ?? false,
  );

  const [isCreating, setIsCreating] = useState(
    location.pathname === "/create-discussion",
  );

  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  // A notice handed over by the detail page after a delete (or another route).
  const [notice, setNotice] = useState(location.state?.notice ?? "");

  // Consume the notice exactly once, so a later refresh does not re-show it and
  // the message is not baked into the history entry.
  useEffect(() => {
    if (!location.state?.notice) return;

    navigate(location.pathname, { replace: true, state: null });

    // Auto-dismiss after a few seconds; the text stays available for a11y via
    // role="status" while it is on screen.
    const timer = setTimeout(() => setNotice(""), 6000);

    return () => clearTimeout(timer);
  }, [location.state, location.pathname, navigate]);

  // Load the category dropdown options when the page first opens.
  useEffect(() => {
    let ignoreResponse = false;

    const loadCategories = async () => {
      try {
        const response = await getCategories();

        // The API wrapper returns the server's response body.
        const categoryList = response.data?.categories;

        if (!ignoreResponse) {
          setCategories(Array.isArray(categoryList) ? categoryList : []);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setCategoryError(requestError.message);
        }
      }
    };

    loadCategories();

    // Ignore the result if the page closes before the request finishes.
    return () => {
      ignoreResponse = true;
    };
  }, []);

  // Load discussions whenever a filter, sort option, or page changes.
  useEffect(() => {
    let ignoreResponse = false;

    const loadDiscussions = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getDiscussions({
          search,
          category,
          page,
          limit: 10,
          sort,
        });

        // Expected backend response:
        // { success, message, data: { discussions: [], pagination: {} } }
        const data = response.data ?? {};
        const discussionList = data.discussions;
        const pagination = data.pagination ?? {};

        if (!ignoreResponse) {
          setDiscussions(
            Array.isArray(discussionList) ? discussionList : [],
          );

          const pages = Number(pagination.totalPages);
          setTotalPages(Number.isFinite(pages) && pages > 0 ? pages : 1);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setDiscussions([]);
          setTotalPages(1);
          setError(requestError.message);
        }
      } finally {
        if (!ignoreResponse) {
          setLoading(false);
        }
      }
    };

    loadDiscussions();

    return () => {
      ignoreResponse = true;
    };
  }, [search, category, page, sort, reloadToken]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // Apply the text in the search box and go back to the first page.
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    setFromHome(false);
    setFromCategory(false);
    setIsEditing(false);

    if (fromCategory) {
      navigate(-1);
      return;
    }

    if (fromHome) {
      navigate("/", { replace: true });
      return;
    }

    navigate("/discussions", { replace: true });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setSort("latest");
    setPage(1);
  };

  // Bumping this re-runs the load effect with the same filters - used by the
  // error state's "Try again" button.
  const retry = () => {
    setPage(1);
    setReloadToken((token) => token + 1);
  };

  const hasActiveFilters =
    Boolean(search) || Boolean(category) || sort !== "latest";

  return (
    <section>
      <PageHeader
        title="Discussions"
        description="Search discussions, filter by category, and choose how they are sorted."
      >
        {/* Creating requires a session; send guests to register instead. */}
        {!authLoading ? (
          <Link
            to={isAuthenticated ? "/create-discussion" : "/login"}
            state={isAuthenticated ? undefined : { from: { pathname: "/create-discussion" } }}
            className={buttonClass("primary", "md")}
          >
            <PlusIcon className="h-4 w-4" />
            New discussion
          </Link>
        ) : null}
      </PageHeader>

      {notice ? (
        <Notice className="mt-6" onDismiss={() => setNotice("")}>
          {notice}
        </Notice>
      ) : null}

      <form
        onSubmit={handleSearchSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <label htmlFor="discussion-search" className={`mb-1 ${labelClass}`}>
            Search
          </label>

          <input
            id="discussion-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search discussions..."
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="discussion-category" className={`mb-1 ${labelClass}`}>
            Category
          </label>

          <select
            id="discussion-category"
            value={category}
            onChange={handleCategoryChange}
            className={selectClass()}
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item._id || item.slug} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          {categoryError ? (
            <p className="mt-1 text-xs text-amber-700">
              Could not load categories: {categoryError}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="discussion-sort" className={`mb-1 ${labelClass}`}>
            Sort by
          </label>

          <select
            id="discussion-sort"
            value={sort}
            onChange={handleSortChange}
            className={selectClass()}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2 lg:col-span-4">
          <button type="submit" className={buttonClass("primary", "md")}>
            Search
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className={buttonClass("secondary", "md")}
          >
            Start a discussion
          </button>
        </header>
      )}

      <div className="mt-6" aria-live="polite">
        {loading ? <CardSkeletonList count={4} lines={2} /> : null}

        {!loading && error ? (
          <ErrorState
            title="Could not load discussions."
            message={error}
            onRetry={retry}
          />
        ) : null}

        {!loading && !error && discussions.length === 0 ? (
          <EmptyState
            icon={hasActiveFilters ? icons.grid : ChatIcon}
            title={
              hasActiveFilters
                ? "No discussions match those filters"
                : "No discussions yet"
            }
            description={
              hasActiveFilters
                ? "Try a different search term, or clear the filters to see everything."
                : "This forum is waiting for its first conversation."
            }
          >
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className={buttonClass("secondary", "md")}
              >
                Clear filters
              </button>
            ) : (
              <Link
                to={isAuthenticated ? "/create-discussion" : "/register"}
                className={buttonClass("primary", "md")}
              >
                {isAuthenticated ? "Start a discussion" : "Join to start one"}
              </Link>
            )}
          </EmptyState>
        ) : null}

        {!loading && !error && discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id ?? discussion.id}
                discussion={discussion}
              />
            ))}
          </div>
        ) : null}
      </div>

      <nav
        aria-label="Discussion pages"
        className="mt-6 flex items-center justify-between"
      >
        <button
          type="button"
          onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
          disabled={page <= 1 || loading}
          className={buttonClass("secondary", "md", "disabled:opacity-50")}
        >
          Previous
        </button>

        <p className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </p>

        <button
          type="button"
          onClick={() =>
            setPage((currentPage) => Math.min(totalPages, currentPage + 1))
          }
          disabled={page >= totalPages || loading}
          className={buttonClass("secondary", "md", "disabled:opacity-50")}
        >
          Next
        </button>
      </nav>
    </section>
  );
};


export default Discussions;
