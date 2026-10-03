function CategoryCard({ category }) {
  if (!category) return null;

  return (
    <div className="rounded-md px-3 py-3 hover:bg-slate-50">
      <h3 className="font-medium text-slate-900">
        {category.name}
      </h3>

      {category.description && (
        <p className="mt-1 text-sm text-slate-500">
          {category.description}
        </p>
      )}
    </div>
  );
}

export default CategoryCard;