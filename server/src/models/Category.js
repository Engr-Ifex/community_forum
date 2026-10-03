import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"],
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Category creator is required"],
    },
  },
  {
    timestamps: true,
  },
);


export default mongoose.model("Category", categorySchema);
