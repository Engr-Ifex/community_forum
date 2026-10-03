import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Discussion title is required"],
      trim: true,
      minlength: [3, "Discussion title must be at least 3 characters"],
      maxlength: [200, "Discussion title cannot exceed 200 characters"],
    },

    content: {
      type: String,
      required: [true, "Discussion content is required"],
      trim: true,
      minlength: [10, "Discussion content must be at least 10 characters"],
      maxlength: [10000, "Discussion content cannot exceed 10000 characters"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Discussion author is required"],
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Discussion category is required"],
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "locked", "removed"],
      default: "active",
      index: true,
    },

    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
  },
  {
    timestamps: true,
  },
);

discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model("Discussion", discussionSchema);