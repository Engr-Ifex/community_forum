import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DiscussionCard from "../Discussions/DiscussionCard";
import CategoryCard from "../Categories/CategoryCard";
import discussions from "../Discussions/DiscussionData";

const categories = [
  {
    id: 1,
    name: "General discussions and conversations",
    description:
      "General discussions, personal projects and everyday conversations.",
  },
  {
    id: 2,
    name: "Lifestyle & Happiness",
    description:
      "Talk about happiness, hobbies, experiences and things that make life enjoyable.",
  },
  {
    id: 3,
    name: "Learning & Education",
    description:
      "Learning, education, skills development and academic discussions.",
  },
  {
    id: 4,
    name: "Advice & Life Lessons",
    description:
      "Share advice, experiences, lessons and useful perspectives on life.",
  },
  {
    id: 5,
    name: "Science & Technology",
    description:
      "Technology, programming, gadgets, science and innovation.",
  },
  {
    id: 6,
    name: "Goals & Personal Development",
    description:
      "Discuss personal goals, self-improvement, education and development.",
  },
  {
    id: 7,
    name: "Entertainment",
    description:
      "Movies, television, music and other forms of entertainment.",
  },
  {
    id: 8,
    name: "Games",
    description:
      "Video games, mobile games, console gaming and gaming culture.",
  },
  {
    id: 9,
    name: "Business & Finance",
    description:
      "Business, budgeting, saving, personal finance and money management.",
  },
  {
    id: 10,
    name: "News & Politics",
    description:
      "Current events, news and political discussions.",
  },
  {
    id: 11,
    name: "Fashion, Beauty & Lifestyle",
    description:
      "Fashion trends, beauty, personal style and lifestyle topics.",
  },
  {
    id: 12,
    name: "Anime",
    description:
      "Anime, manga, Japanese animation and recommendations.",
  },
  {
    id: 13,
    name: "Nature",
    description:
      "Animals, plants, the environment and beautiful natural places.",
  },
  {
    id: 14,
    name: "Relationships & Dating",
    description:
      "Relationships, dating, friendships, communication and social connections.",
  },
  {
    id: 15,
    name: "Food & Cooking",
    description:
      "Favourite meals, recipes, cooking techniques and food experiences.",
  },
  {
    id: 16,
    name: "Stocks & Investments",
    description:
      "Stocks, investing strategies, financial markets and investment education.",
  },
  {
    id: 17,
    name: "Crypto & Forex",
    description:
      "Cryptocurrency, forex, currency markets and financial market discussions.",
  },
  {
    id: 18,
    name: "History & Culture",
    description:
      "Historical events, cultures, traditions and heritage.",
  },
  {
    id: 19,
    name: "Travel & Tourism",
    description:
      "Travel destinations, tourism, holidays and travel experiences.",
  },
  {
    id: 20,
    name: "Auto Hub & Auto Talk",
    description:
      "Cars, motorcycles, maintenance, modifications and automotive discussions.",
  },
];

const discussionsPerPage = 5;

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredDiscussions = discussions.filter((discussion) => {
    const search = searchTerm.toLowerCase();

    return (
      discussion.title.toLowerCase().includes(search) ||
      discussion.content.toLowerCase().includes(search) ||
      discussion.author.toLowerCase().includes(search)
    );
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
      },
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
          <h1 className="mb-4 text-2xl font-bold text-slate-900">
            Recent Discussions
          </h1>

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

          <div className="rounded-md border border-slate-200 bg-white p-2">
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