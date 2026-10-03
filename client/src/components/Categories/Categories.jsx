const Categories = () => { return ( <section> <div className="mb-8"> <h1 className="text-3xl font-bold text-slate-900"> Categories </h1>
    <p className="mt-2 text-slate-600">
      Browse discussions by category.
    </p>
  </div>

  <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-xl font-semibold text-slate-900">
      Create Category
    </h2>

    <div className="flex gap-3">
      <input
        type="text"
        placeholder="Category name"
        className="flex-1 rounded-md border border-slate-300 px-4 py-2"
      />

      <button
        type="button"
        className="rounded-md bg-slate-900 px-5 py-2 text-white"
      >
        Create
      </button>
    </div>
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        General
      </h2>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          Edit
        </button>

        <button
          type="button"
          className="rounded-md bg-red-600 px-3 py-2 text-white"
        >
          Delete
        </button>
      </div>
    </div>

    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Technology
      </h2>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2"
        >
          Edit
        </button>

        <button
          type="button"
          className="rounded-md bg-red-600 px-3 py-2 text-white"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</section>
); };

export default Categories;