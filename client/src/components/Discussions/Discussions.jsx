import { useState } from "react";

import CreateDiscussion from "./CreateDiscussion";
import DiscussionCard from "./DiscussionCard";
import DiscussionDetails from "./DiscussionDetails";
import EditDiscussion from "./EditDiscussion";

const getDiscussionId = (discussion) => discussion.id ?? discussion._id;

const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const selectedDiscussion = discussions.find(
    (discussion) => String(getDiscussionId(discussion)) === String(selectedDiscussionId),
  );

  const handleCreate = (discussionData) => {
    const discussion = {
      ...discussionData,
      id: globalThis.crypto?.randomUUID?.() ?? Date.now(),
      author: "You",
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setDiscussions((currentDiscussions) => [discussion, ...currentDiscussions]);
    setIsCreating(false);
    setSelectedDiscussionId(getDiscussionId(discussion));
  };

  const handleUpdate = (updatedDiscussion) => {
    const updatedId = getDiscussionId(updatedDiscussion);
    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        String(getDiscussionId(discussion)) === String(updatedId)
          ? updatedDiscussion
          : discussion,
      ),
    );
    setIsEditing(false);
  };

  const handleDelete = (discussionId) => {
    setDiscussions((currentDiscussions) =>
      currentDiscussions.filter(
        (discussion) => String(getDiscussionId(discussion)) !== String(discussionId),
      ),
    );

    if (String(selectedDiscussionId) === String(discussionId)) {
      setSelectedDiscussionId(null);
      setIsEditing(false);
    }
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    setIsEditing(false);
  };

  return (
    <section>
      {!selectedDiscussion && (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">Discussions</h1>
          {!isCreating && (
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Start a discussion
            </button>
          )}
        </header>
      )}

      {isCreating ? (
        <CreateDiscussion
          onCreate={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      ) : selectedDiscussion ? (
        isEditing ? (
          <EditDiscussion
            discussion={selectedDiscussion}
            onSave={handleUpdate}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <DiscussionDetails
            discussion={selectedDiscussion}
            onBack={handleBack}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />
        )
      ) : discussions.length ? (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <DiscussionCard
              key={getDiscussionId(discussion)}
              discussion={discussion}
              onView={setSelectedDiscussionId}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <p className="border-t border-slate-200 py-6 text-slate-600">
          No discussions yet.
        </p>
      )}
    </section>
  );
};

export default Discussions;
