import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import initialCategories from "../Categories/CategoryData";

const Admin = () => {
  const { user } = useAuth();

  const [categories, setCategories] = useState(initialCategories);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Only administrators can manage categories.
  if (user?.role !== "admin") {
    return (
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">
          Access denied
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Only administrators can manage forum categories.
        </p>
      </section>
    );
  }

  const handleCreateCategory = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Enter a category name and description.");
      return;
    }

    const categoryExists = categories.some(
      (category) =>
        category.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (categoryExists) {
      setError("A category with this name already exists.");
      return;
    }

    const newCategory = {
      id: Date.now(),
      name: trimmedName,
      description: trimmedDescription,
    };

    setCategories((currentCategories) => [
      ...currentCategories,
      newCategory,
    ]);

    setName("");
    setDescription("");
    setError("");

    showSuccessMessage("Category created successfully.");
  };

  const handleEditClick = (category) => {
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setError("");
  };

  const handleUpdateCategory = (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedDescription) {
      setError("Enter a category name and description.");
      return;
    }

    const categoryExists = categories.some(
      (category) =>
        category.id !== editingCategoryId &&
        category.name.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (categoryExists) {
      setError("A category with this name already exists.");
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.map((category) =>
        category.id === editingCategoryId
          ? {
              ...category,
              name: trimmedName,
              description: trimmedDescription,
            }
          : category,
      ),
    );

    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setError("");

    showSuccessMessage("Category updated successfully.");
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDelete = () => {
    if (!categoryToDelete) {
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter(
        (category) => category.id !== categoryToDelete.id,
      ),
    );

    setCategoryToDelete(null);
    setError("");

    showSuccessMessage("Category deleted successfully.");
  };

  const handleCancelDelete = () => {
    setCategoryToDelete(null);
  };

  const isEditing = editingCategoryId !== null;

  return (
    <section>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Category Management
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Create and manage forum categories.
        </p>
      </header>

      {successMessage && (
        <p
          role="status"
          className="mb-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          {successMessage}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
        >
          {error}
        </p>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {isEditing ? "Edit category" : "Create category"}
        </h2>

        <form
          onSubmit={
            isEditing
              ? handleUpdateCategory
              : handleCreateCategory
          }
          className="mt-5 space-y-5"
        >
          <div>
            <label
              htmlFor="category-name"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Category name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter category name"
              className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            />
          </div>

          <div>
            <label
              htmlFor="category-description"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Description
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe this category"
              rows={4}
              className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              {isEditing
                ? "Save changes"
                : "Create category"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Existing categories
        </h2>

        <div className="mt-4 space-y-3">
          {categories.map((category) => (
            <article
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5"
            >
              <div>
                <h3 className="font-semibold text-slate-900">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-slate-600">
                  {category.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEditClick(category)}
                  className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(category)}
                  className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {categoryToDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            aria-describedby="delete-category-description"
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
          >
            <h2
              id="delete-category-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete category?
            </h2>

            <p
              id="delete-category-description"
              className="mt-2 text-sm leading-6 text-slate-600"
            >
              Are you sure you want to delete{" "}
              <strong>{categoryToDelete.name}</strong>? This
              action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete category
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Admin;