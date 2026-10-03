import { Link, useParams } from "react-router-dom";
const CategoryPage = () => { const { id } = useParams();
return ( <section> <Link
to="/categories"
className="text-sm text-slate-600 hover:underline"
> ← Back to Categories </Link>
  <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 className="text-3xl font-bold text-slate-900">
      Category
    </h1>

    <p className="mt-2 text-slate-600">
      Category ID: {id}
    </p>

    <h2 className="mt-6 text-xl font-semibold text-slate-900">
      Discussions
    </h2>

    <p className="mt-2 text-slate-600">
      Discussions in this category will appear here.
    </p>
  </div>
</section>
); };
export default CategoryPage;