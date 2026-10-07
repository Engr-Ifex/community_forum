import { useEffect, useId, useRef, useState } from "react";

import { getFieldErrors } from "../../services/auth";
import { buttonClass } from "../common/ui";
import ErrorMessage from "../common/ErrorMessage";

/**
 * Create/edit dialog for a category.
 *
 * One component covers both modes: `category` being present means edit. That
 * keeps the validation rules, field markup and error handling in a single
 * place instead of drifting between two near-identical forms.
 *
 * Client-side validation mirrors the backend's rules so obvious mistakes are
 * caught before a round trip; the backend stays the authority and its
 * field-level errors are merged in on top.
 */
const CategoryFormDialog = ({
  category = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const isEdit = Boolean(category);

  const titleId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const nameErrorId = useId();
  const descriptionErrorId = useId();

  const nameRef = useRef(null);

  // Edit seeds from the existing record; create starts empty.
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  // Escape closes the dialog, matching the confirmation dialog's behaviour.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !isSubmitting) onCancel();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, isSubmitting]);

  const validate = () => {
    const errors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      errors.name = "Category name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Category name must be at least 2 characters.";
    } else if (trimmedName.length > 100) {
      errors.name = "Category name cannot exceed 100 characters.";
    }

    if (description.trim().length > 500) {
      errors.description = "Description cannot exceed 500 characters.";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const errors = validate();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
    } catch (requestError) {
      // A 409 duplicate belongs on the name field; validation errors arrive as
      // a structured array; anything else is a form-level message.
      const backendFieldErrors = getFieldErrors(requestError);
      const status = requestError?.status;

      if (status === 409) {
        setNameErrorFallback(setFieldErrors, requestError.message);
      } else if (Object.keys(backendFieldErrors).length > 0) {
        setFieldErrors(backendFieldErrors);
      } else {
        setFormError(requestError.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={isSubmitting}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {isEdit ? "Edit category" : "Create category"}
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          {isEdit
            ? "Update the name or description. Names must stay unique."
            : "Categories group discussions into topics. Names must be unique."}
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-5">
          <label htmlFor={nameId} className="block text-sm font-medium text-slate-700">
            Name
          </label>

          <input
            id={nameId}
            ref={nameRef}
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldErrors.name) {
                setFieldErrors((current) => ({ ...current, name: "" }));
              }
            }}
            maxLength={100}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? nameErrorId : undefined}
            placeholder="e.g. help and support"
            className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
              fieldErrors.name
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
            }`}
          />

          {fieldErrors.name ? (
            <p id={nameErrorId} className="mt-1.5 text-sm text-red-700">
              {fieldErrors.name}
            </p>
          ) : null}

          <label
            htmlFor={descriptionId}
            className="mt-4 block text-sm font-medium text-slate-700"
          >
            Description <span className="font-normal text-slate-500">(optional)</span>
          </label>

          <textarea
            id={descriptionId}
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              if (fieldErrors.description) {
                setFieldErrors((current) => ({ ...current, description: "" }));
              }
            }}
            rows={3}
            maxLength={500}
            aria-invalid={Boolean(fieldErrors.description)}
            aria-describedby={
              fieldErrors.description ? descriptionErrorId : undefined
            }
            placeholder="What belongs in this category?"
            className={`mt-1.5 w-full resize-y rounded-lg border px-3 py-2 text-slate-900 outline-none transition focus:ring-2 ${
              fieldErrors.description
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
            }`}
          />

          <div className="mt-1.5 flex items-center justify-between">
            {fieldErrors.description ? (
              <p id={descriptionErrorId} className="text-sm text-red-700">
                {fieldErrors.description}
              </p>
            ) : (
              <span />
            )}

            <span className="text-xs text-slate-500">{description.length}/500</span>
          </div>

          {formError ? (
            <div className="mt-4">
              <ErrorMessage message={formError} />
            </div>
          ) : null}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className={buttonClass("secondary", "md")}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={buttonClass("primary", "md")}
            >
              {isSubmitting
                ? isEdit
                  ? "Saving..."
                  : "Creating..."
                : isEdit
                  ? "Save changes"
                  : "Create category"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

/** A 409 from the API names no field, so it is surfaced on the name input. */
const setNameErrorFallback = (setFieldErrors, message) => {
  setFieldErrors((current) => ({
    ...current,
    name: message || "A category with this name already exists.",
  }));
};

export default CategoryFormDialog;
