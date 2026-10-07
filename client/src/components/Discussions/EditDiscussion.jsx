import { useState } from "react";

import { buttonClass, inputClass, labelClass, textareaClass } from "../common/ui";

/**
 * Edit form for a discussion.
 *
 * The parent keys this component by discussion id, so switching discussions
 * remounts it and re-seeds state from the new props. That keeps the seeding out
 * of an effect, which would otherwise cause a cascading render.
 */
function EditDiscussion({ discussion = {}, onSave, onCancel }) {
  const [title, setTitle] = useState(discussion.title ?? "");
  const [content, setContent] = useState(discussion.content ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Enter both a title and discussion content.");
      return;
    }

    onSave?.({
      ...discussion,
      title: trimmedTitle,
      content: trimmedContent,
    });
  };

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Edit discussion</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="discussion-title" className={`mb-1 ${labelClass}`}>
            Title
          </label>

          <input
            id="discussion-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className={inputClass()}
          />
        </div>

        <div>
          <label htmlFor="discussion-content" className={`mb-1 ${labelClass}`}>
            Content
          </label>

          <textarea
            id="discussion-content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            required
            className={textareaClass()}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button type="submit" className={buttonClass("primary", "md")}>
            Save changes
          </button>

          <button
            type="button"
            onClick={onCancel}
            className={buttonClass("secondary", "md")}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditDiscussion;
