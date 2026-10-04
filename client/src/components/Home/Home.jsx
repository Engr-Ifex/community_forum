import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DiscussionCard from "../Discussions/DiscussionCard";
import CategoryCard from "../Categories/CategoryCard";
import categories from "../Categories/CategoryData";
import discussions from "../Discussions/DiscussionData";

const discussionsPerPage = 5;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(
    location.state?.category || "",
  );

  useEffect(() => {
    setSelectedCategory(location.state?.category || "");
    setCurrentPage(1);
  }, [location.state]);

  const filteredDiscussions = discussions.filter((discussion) => {
  const search = searchTerm.toLowerCase();

  const matchesSearch =
    discussion.title.toLowerCase().includes(search) ||
    discussion.content.toLowerCase().includes(search) ||
    discussion.author.toLowerCase().includes(search) ||
    discussion.category.toLowerCase().includes(search);

  const matchesCategory =
    !selectedCategory || discussion.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDiscussions.length / discussionsPerPage),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * discussionsPerPage;

  const currentDiscussions = filteredDiscussions.slice(
    startIndex,
    startIndex + discussionsPerPage,
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleViewDiscussion = (id) => {
  navigate("/discussions", {
    state: {
      discussionId: id,
      fromHome: true,
    },
  });
};

  const handleShowAll = () => {
    setSelectedCategory("");
    setCurrentPage(1);
    navigate("/", {
      replace: true,
      state: {},
    });
  };

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
        />

        <Link
          to="/create-discussion"
          className="rounded-md bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
        >
          + Create Discussion
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {selectedCategory || "Recent Discussions"}
              </h1>

              {selectedCategory && (
                <p className="mt-1 text-sm text-slate-500">
                  Discussions in this category
                </p>
              )}
            </div>

            {selectedCategory && (
              <button
                type="button"
                onClick={handleShowAll}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                All Discussions
              </button>
            )}
          </div>

          <div className="space-y-4">
            {currentDiscussions.length > 0 ? (
              currentDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  onView={handleViewDiscussion}
                />
              ))
            ) : (
              <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-500">
                No discussions found.
              </p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ←
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1,
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-md px-3 py-2 text-sm ${
                    safeCurrentPage === page
                      ? "bg-slate-900 text-white"
                      : "border border-slate-300 bg-white hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                →
              </button>
            </div>
          )}
        </div>

        <aside>
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Categories
          </h2>

          <div className="mb-3">
            <button
              type="button"
              onClick={handleShowAll}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              All Discussions
            </button>
          </div>

          <div className="grid gap-3">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
              />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default Home;