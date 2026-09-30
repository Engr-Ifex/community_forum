import mongoose from "mongoose";

const moderationActionSchema = new mongoose.Schema(
  {
    moderator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Moderator is required"],
      index: true,
    },

    action: {
      type: String,
      enum: [
        "remove_discussion",
        "remove_reply",
        "lock_discussion",
        "dismiss_report",
        "resolve_report",
      ],
      required: [true, "Moderation action is required"],
      index: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Moderation target is required"],
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: [
        1000,
        "Moderation reason cannot exceed 1000 characters",
      ],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "ModerationAction",
  moderationActionSchema,
);
