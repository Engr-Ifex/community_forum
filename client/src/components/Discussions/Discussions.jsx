import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

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
  const { isAuthenticated } = useAuth();

  const [discussions, setDiscussions] = useState(initialDiscussions);

  const [selectedDiscussionId, setSelectedDiscussionId] = useState(
    location.state?.discussionId ?? null,
  );

  const [fromHome, setFromHome] = useState(
    location.state?.fromHome ?? false,
  );

  const [fromCategory, setFromCategory] = useState(
    location.state?.fromCategory ?? false,
  );

  const [isCreating, setIsCreating] = useState(
    location.pathname === "/create-discussion",
  );

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.pathname === "/create-discussion") {
      setIsCreating(true);
      setSelectedDiscussionId(null);
      setFromHome(false);
      setFromCategory(false);
      setIsEditing(false);
      return;
    }

    if (location.state?.discussionId !== undefined) {
      setSelectedDiscussionId(location.state.discussionId);
      setFromHome(location.state?.fromHome ?? false);
      setFromCategory(location.state?.fromCategory ?? false);
      setIsCreating(false);
      setIsEditing(false);
    }
  }, [location.pathname, location.state]);

  const selectedDiscussion = discussions.find(
    (discussion) =>
      String(getDiscussionId(discussion)) ===
      String(selectedDiscussionId),
  );

  const handleStartDiscussion = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setIsCreating(true);
  };

  const handleCreate = (discussionData) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const discussion = {
      ...discussionData,
      id: globalThis.crypto?.randomUUID?.() ?? Date.now(),
      author: "You",
      createdAt: new Date().toISOString(),
      replies: [],
      replyCount: 0,
    };

    setDiscussions((currentDiscussions) => [
      discussion,
      ...currentDiscussions,
    ]);

    setIsCreating(false);
    setSelectedDiscussionId(getDiscussionId(discussion));

    navigate("/discussions", { replace: true });
  };

  const handleReply = (replyContent) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      selectedDiscussionId === null ||
      selectedDiscussionId === undefined
    ) {
      return;
    }

    const newReply = {
      id: globalThis.crypto?.randomUUID?.() ?? Date.now(),
      author: "You",
      content: replyContent,
      createdAt: new Date().toISOString(),
    };

    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) => {
        if (
          String(getDiscussionId(discussion)) !==
          String(selectedDiscussionId)
        ) {
          return discussion;
        }

        const existingReplyCount =
          discussion.replyCount ??
          (Array.isArray(discussion.replies)
            ? discussion.replies.length
            : discussion.replies ?? 0);

        const existingReplies = Array.isArray(discussion.replies)
          ? discussion.replies
          : [];

        return {
          ...discussion,
          replies: [...existingReplies, newReply],
          replyCount: existingReplyCount + 1,
        };
      }),
    );
  };

  const handleUpdate = (updatedDiscussion) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const updatedId = getDiscussionId(updatedDiscussion);

    setDiscussions((currentDiscussions) =>
      currentDiscussions.map((discussion) =>
        String(getDiscussionId(discussion)) === String(updatedId)
          ? updatedDiscussion
          : discussion,
      ),
    );

    setIsEditing(false);
    setSuccessMessage("Discussion updated successfully.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleDelete = (discussionId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

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

    setSuccessMessage("Discussion deleted successfully.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    setFromHome(false);
    setFromCategory(false);
    setIsEditing(false);

    if (fromCategory) {
      navigate(-1);
      return;
    }

    if (fromHome) {
      navigate("/", { replace: true });
      return;
    }

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
      {successMessage && (
        <p
          role="status"
          className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"
        >
          {successMessage}
        </p>
      )}

      {!selectedDiscussion && !isCreating && (
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            Discussions
          </h1>

          <button
            type="button"
            onClick={handleStartDiscussion}
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
            onReply={handleReply}
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