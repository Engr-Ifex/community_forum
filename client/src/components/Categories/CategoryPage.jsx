import { useNavigate, useParams } from "react-router-dom";
import categories from "./CategoryData";
import discussions from "../Discussions/DiscussionData";
import DiscussionCard from "../Discussions/DiscussionCard";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const category = categories.find(
    (item) => String(item.id) === String(categoryId),
  );

  if (!category) {
    return (
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">
          Category not found
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          The category you are looking for does not exist.
        </p>
      </section>
    );
  }

  const categoryDiscussions = discussions.filter(
    (discussion) => discussion.category === category.name,
  );

  const handleViewDiscussion = (id) => {
    navigate("/discussions", {
      state: {
        discussionId: id,
        fromCategory: true,
      },
    });
  };

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate("/categories")}
        className="mb-6 text-sm font-medium text-slate-700 hover:underline"
      >
        ← Back to categories
      </button>

      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {category.name}
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          {category.description}
        </p>
      </header>

      <div className="space-y-4">
        {categoryDiscussions.length > 0 ? (
          categoryDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onView={handleViewDiscussion}
            />
          ))
        ) : (
          <p className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-500">
            No discussions in this category yet.
          </p>
        )}
      </div>
    </section>
  );
};

export default CategoryPage;