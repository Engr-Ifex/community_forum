import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    // The discussion this reply belongs to.
    discussion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discussion",
      required: [true, "Reply discussion is required"],
      index: true,
    },

    body: {
      type: String,
      required: [true, "Reply body is required"],
      trim: true,
      minlength: [1, "Reply body cannot be empty"],
      maxlength: [5000, "Reply cannot exceed 5000 characters"],
    },

    // The ID of the user who wrote this reply.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reply author is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Helps find one user's replies in newest-first order.
replySchema.index({ author: 1, createdAt: -1 });

// Helps find replies belonging to one discussion.
replySchema.index({ discussion: 1, createdAt: 1 });

export default mongoose.model("Reply", replySchema);
