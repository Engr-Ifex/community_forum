import { useState } from "react"; import { useParams } from "react-router-dom";
const Discussions = () => { const { id } = useParams(); const [reply, setReply] = useState("");
const handleReply = (e) => { e.preventDefault();
if (!reply.trim()) return;

setReply("");
};
return ( <section> <h1 className="text-3xl font-bold text-slate-900"> Discussion </h1>
  <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6">
    <h2 className="text-xl font-semibold">
      Original Post
    </h2>

    <p className="mt-3 text-slate-600">
      Discussion ID: {id || "No discussion selected"}
    </p>
  </div>

  <div className="mt-6">
    <h2 className="text-2xl font-semibold">
      Replies
    </h2>

    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
      <p className="font-medium">User</p>

      <p className="mt-2 text-slate-600">
        Replies will appear here.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded-md border px-3 py-2"
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

  <form
    onSubmit={handleReply}
    className="mt-6 rounded-lg border border-slate-200 bg-white p-5"
  >
    <h2 className="text-xl font-semibold">
      Reply
    </h2>

    <textarea
      value={reply}
      onChange={(e) => setReply(e.target.value)}
      placeholder="Write your reply..."
      rows={4}
      className="mt-4 w-full rounded-md border border-slate-300 p-3"
    />

    <button
      type="submit"
      className="mt-3 rounded-md bg-slate-900 px-5 py-2 text-white"
    >
      Reply
    </button>
  </form>
</section>
); };
export default Discussions;