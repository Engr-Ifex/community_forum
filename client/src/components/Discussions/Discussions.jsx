import { useEffect, useState } from "react";

import { getCategories } from "../../services/categories";
import { getDiscussions } from "../../services/discussions";
import DiscussionCard from "./DiscussionCard";

const Discussions = () => {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [error, setError] = useState("");

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
  }, [search, category, page, sort]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    // Apply the text in the search box and go back to the first page.
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleCategoryChange = (event) => {
    setPage(1);
    setCategory(event.target.value);
  };

  const handleSortChange = (event) => {
    setPage(1);
    setSort(event.target.value);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setSort("latest");
    setPage(1);
  };

  return (
    <section>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Discussions
        </h1>

        <p className="mt-2 text-slate-600">
          Search discussions, filter by category, and choose how they are sorted.
        </p>
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
      >
        <div className="lg:col-span-2">
          <label
            htmlFor="discussion-search"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Search
          </label>

          <input
            id="discussion-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search discussions..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="discussion-category"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Category
          </label>

          <select
            id="discussion-category"
            value={category}
            onChange={handleCategoryChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item._id || item.slug} value={item.slug}>
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
          <label
            htmlFor="discussion-sort"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Sort by
          </label>

          <select
            id="discussion-sort"
            value={sort}
            onChange={handleSortChange}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Popular</option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Search
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Clear filters
          </button>
        </div>
      </form>

      <div className="mt-6" aria-live="polite">
        {loading ? (
          <p className="rounded-lg bg-white p-5 text-slate-600">
            Loading discussions...
          </p>
        ) : null}

        {!loading && error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-medium">Could not load discussions.</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : null}

        {!loading && !error && discussions.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-600">
            No discussions found. Try another search or clear the filters.
          </p>
        ) : null}

        {!loading && !error && discussions.length > 0 ? (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <DiscussionCard
                key={discussion._id}
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
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
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
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </section>
  );
};

export default Discussions;