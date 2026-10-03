import { useState } from "react";

function CreateDiscussion({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || !trimmedContent) {
      setError("Enter both a title and discussion content.");
      return;
    }

    onCreate?.({ title: trimmedTitle, content: trimmedContent });
    setTitle("");
    setContent("");
    setError("");
  };

  return (
    <section className="max-w-2xl">
      <h2 className="text-2xl font-semibold text-slate-900">Create discussion</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="new-discussion-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="new-discussion-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          />
        </div>

        <div>
          <label htmlFor="new-discussion-content" className="mb-1 block text-sm font-medium text-slate-700">
            Content
          </label>
          <textarea
            id="new-discussion-content"
            name="content"
            placeholder="What's happening?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            required
            className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create discussion
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default CreateDiscussion;