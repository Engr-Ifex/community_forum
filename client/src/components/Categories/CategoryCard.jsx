import { useNavigate } from "react-router-dom";

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    navigate(`/categories/${category.id}`);
};

  return (
    <button
      type="button"
      onClick={handleCategoryClick}
      className="block w-full rounded-lg border border-slate-200 bg-white p-5 text-left transition hover:border-slate-400 hover:bg-slate-50"
    >
      <h2 className="text-lg font-semibold text-slate-900">
        {category.name}
      </h2>

      <p className="mt-2 text-sm text-slate-600">
        {category.description}
      </p>
    </button>
  );
};

export default CategoryCard;