import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter is required"],
      index: true,
    },

    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      default: null,
      index: true,
    },

    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
      default: null,
      index: true,
    },

    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
      minlength: [3, "Report reason must be at least 3 characters"],
      maxlength: [1000, "Report reason cannot exceed 1000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Report", reportSchema);
