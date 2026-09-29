import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Discussion title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    body: {
      type: String,
      required: [true, "Discussion body is required"],
      trim: true,
      minlength: [1, "Discussion body cannot be empty"],
    },

    // The ID of the user who created this discussion.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Discussion author is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helps find one user's discussions in newest-first order.
discussionSchema.index({ author: 1, createdAt: -1 });

export default mongoose.model("Discussion", discussionSchema);
