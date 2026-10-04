import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createDiscussion } from "../../services/discussions";
import { getCategories } from "../../services/categories";
import { getFieldErrors } from "../../services/auth";
import {
  buttonClass,
  fieldErrorClass,
  hintClass,
  inputClass,
  labelClass,
  selectClass,
  textareaClass,
} from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

/**
 * Create-discussion form.
 *
 * The backend requires `category` to be a Category ObjectId, so this loads the
 * real category list rather than accepting free text. On success the user is
 * taken straight to the new discussion, which is the most useful next step.
 */
const CreateDiscussion = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let ignoreResponse = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);

      try {
        const response = await getCategories();
        const categoryList = response.data?.categories;

        if (!ignoreResponse) {
          setCategories(Array.isArray(categoryList) ? categoryList : []);
        }
      } catch (requestError) {
        if (!ignoreResponse) {
          setError(requestError.message);
        }
      } finally {
        if (!ignoreResponse) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      ignoreResponse = true;
    };
  }, []);

  /** Mirror the backend's rules so obvious mistakes never cost a round trip. */
  const validate = () => {
    const next = {};

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      next.title = "A title is required.";
    } else if (trimmedTitle.length < 3) {
      next.title = "Title must be at least 3 characters.";
    } else if (trimmedTitle.length > 200) {
      next.title = "Title cannot exceed 200 characters.";
    }

    if (!category) {
      next.category = "Choose a category.";
    }

    if (!trimmedContent) {
      next.content = "Some content is required.";
    } else if (trimmedContent.length < 10) {
      next.content = "Content must be at least 10 characters.";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validation = validate();

    if (Object.keys(validation).length) {
      setFieldErrors(validation);
      setError("Check the highlighted fields and try again.");
      return;
    }

    setError("");
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        category,
      });

      const created = response.data?.discussion;
      const createdId = created?._id ?? created?.id;

      // Land on the new discussion with a confirmation the page can show.
      navigate(createdId ? `/discussions/${createdId}` : "/discussions", {
        replace: true,
        state: { notice: "Your discussion was published." },
      });
    } catch (requestError) {
      // Surface the backend's per-field errors when it sends them.
      setFieldErrors(getFieldErrors(requestError));
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Create discussion
      </h1>

      <p className="mt-2 text-slate-600">
        Give it a clear title, pick the right category, and add enough detail
        for others to respond.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="new-discussion-title"
            className={labelClass}
          >
            Title
          </label>


          <input
            id="new-discussion-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            aria-invalid={Boolean(fieldErrors.title)}
            aria-describedby={
              fieldErrors.title ? "new-discussion-title-error" : undefined
            }
            className={inputClass(Boolean(fieldErrors.title))}
          />

          {fieldErrors.title ? (
            <p id="new-discussion-title-error" className={fieldErrorClass}>
              {fieldErrors.title}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="new-discussion-category"
            className={labelClass}
          >
            Category
          </label>

          <select
            id="new-discussion-category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={categoriesLoading}
            aria-invalid={Boolean(fieldErrors.category)}
            aria-describedby={
              fieldErrors.category ? "new-discussion-category-error" : undefined
            }
            className={selectClass(Boolean(fieldErrors.category), "disabled:opacity-60")}
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "Choose a category"}
            </option>

            {categories.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </select>

          {fieldErrors.category ? (
            <p id="new-discussion-category-error" className={fieldErrorClass}>
              {fieldErrors.category}
            </p>
          ) : null}

          {!categoriesLoading && categories.length === 0 ? (
            <p className="text-xs text-amber-700">
              No categories exist yet, so a discussion cannot be filed. Ask an
              administrator to create one.
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="new-discussion-content"
            className={labelClass}
          >
            Content
          </label>


          <textarea
            id="new-discussion-content"
            name="content"
            placeholder="What's on your mind?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={8}
            maxLength={10000}
            aria-invalid={Boolean(fieldErrors.content)}
            aria-describedby={
              fieldErrors.content ? "new-discussion-content-error" : undefined
            }
            className={textareaClass(Boolean(fieldErrors.content))}
          />

          {fieldErrors.content ? (
            <p id="new-discussion-content-error" className={fieldErrorClass}>
              {fieldErrors.content}
            </p>
          ) : (
            <p className={hintClass}>
              At least 10 characters. {content.trim().length}/10000
            </p>
          )}
        </div>

        {error ? <ErrorMessage message={error} /> : null}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting || categoriesLoading}
            className={buttonClass("primary", "md")}
          >
            {isSubmitting ? "Creating..." : "Create discussion"}
          </button>

          <Link to="/discussions" className={buttonClass("secondary", "md")}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
};

export default CreateDiscussion;

