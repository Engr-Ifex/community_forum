import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Reply content is required"],
      trim: true,
      minlength: [1, "Reply cannot be empty"],
      maxlength: [5000, "Reply cannot exceed 5000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reply author is required"],
      index: true,
    },

    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: [true, "Discussion is required"],
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "removed"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

replySchema.index({ discussion: 1, createdAt: 1 });

export default mongoose.model("Reply", replySchema);