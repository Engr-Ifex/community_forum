import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CreateDiscussion from "./CreateDiscussion";
import DiscussionCard from "./DiscussionCard";
import DiscussionDetails from "./DiscussionDetails";
import EditDiscussion from "./EditDiscussion";
import initialDiscussions from "./DiscussionData";

const getDiscussionId = (discussion) =>
  discussion.id ?? discussion._id;

const Discussions = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [discussions, setDiscussions] = useState(initialDiscussions);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(
    location.state?.discussionId ?? null,
  );
  const [isCreating, setIsCreating] = useState(
    location.pathname === "/create-discussion",
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (location.pathname === "/create-discussion") {
      setIsCreating(true);
      setSelectedDiscussionId(null);
      setIsEditing(false);
      return;
    }

    if (location.state?.discussionId !== undefined) {
      setSelectedDiscussionId(location.state.discussionId);
      setIsCreating(false);
      setIsEditing(false);
    }
  }, [location.pathname, location.state]);

  const selectedDiscussion = discussions.find(
    (discussion) =>
      String(getDiscussionId(discussion)) ===
      String(selectedDiscussionId),
  );

  const handleCreate = (discussionData) => {
    const discussion = {
      ...discussionData,
      id: globalThis.crypto?.randomUUID?.() ?? Date.now(),
      author: "You",
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setDiscussions((currentDiscussions) => [
      discussion,
      ...currentDiscussions,
    ]);

    setIsCreating(false);
    setSelectedDiscussionId(getDiscussionId(discussion));

    navigate("/discussions", { replace: true });
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
        (discussion) =>
          String(getDiscussionId(discussion)) !==
          String(discussionId),
      ),
    );

    if (
      String(selectedDiscussionId) === String(discussionId)
    ) {
      setSelectedDiscussionId(null);
      setIsEditing(false);
    }
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    setIsEditing(false);
    navigate("/discussions", { replace: true });
  };

  const handleCancelCreate = () => {
    setIsCreating(false);

    if (location.pathname === "/create-discussion") {
      navigate("/discussions", { replace: true });
    }
  };

  return (
    <section>
      {!selectedDiscussion && !isCreating && (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Discussions
          </h1>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Start a discussion
          </button>
        </header>
      )}

      {isCreating ? (
        <CreateDiscussion
          onCreate={handleCreate}
          onCancel={handleCancelCreate}
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
      ) : (
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
      )}
    </section>
  );
};

export default Discussions;