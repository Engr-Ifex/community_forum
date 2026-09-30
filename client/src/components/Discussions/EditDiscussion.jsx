import { useEffect, useState } from "react";

function EditDiscussion({ discussion = {}, onSave, onCancel }) {
  const [title, setTitle] = useState(discussion.title ?? "");
  const [content, setContent] = useState(discussion.content ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(discussion.title ?? "");
    setContent(discussion.content ?? "");
    setError("");
  }, [discussion.title, discussion.content]);

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
          <label htmlFor="discussion-title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="discussion-title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          />
        </div>

        <div>
          <label htmlFor="discussion-content" className="mb-1 block text-sm font-medium text-slate-700">
            Content
          </label>
          <textarea
            id="discussion-content"
            name="content"
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
            Save changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditDiscussion;