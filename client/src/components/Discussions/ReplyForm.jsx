import { useState } from "react";

function ReplyForm({ onReply }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      setError("Enter a reply before submitting.");
      return;
    }

    onReply?.(trimmedContent);

    setContent("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <label
        htmlFor="reply-content"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Add a reply
      </label>

      <textarea
        id="reply-content"
        name="reply"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write your reply..."
        rows={4}
        className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="mt-3 rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
      >
        Post reply
      </button>
    </form>
  );
}

export default ReplyForm;