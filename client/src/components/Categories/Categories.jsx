import CategoryCard from "./CategoryCard";
import categories from "./CategoryData";

const Categories = () => {
  return (
    <section>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Categories
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Explore discussions by category.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </section>
  );
};

export default Categories;