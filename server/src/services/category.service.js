import createError from "http-errors";

import Category from "../models/Category.js";

export const createCategory = async ({
  name,
  description,
  createdBy,
}) => {
  const normalizedName = name.trim().toLowerCase();

  const existingCategory = await Category.findOne({
    name: normalizedName,
  });

  if (existingCategory) {
    throw createError(
      409,
      "A category with this name already exists",
    );
  }

  const category = await Category.create({
    name: normalizedName,
    description: description?.trim() ?? "",
    createdBy,
  });

  return category;
};

export const getCategories = async () => {
  return Category.find()
    .sort({ name: 1 })
    .lean();
};

export const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId).lean();

  if (!category) {
    throw createError(404, "Category not found");
  }

  return category;
};

export const updateCategory = async (
  categoryId,
  updates,
) => {
  const updateData = {};

  if (updates.name !== undefined) {
    const normalizedName = updates.name.trim().toLowerCase();

    const existingCategory = await Category.findOne({
      name: normalizedName,
      _id: { $ne: categoryId },
    });

    if (existingCategory) {
      throw createError(
        409,
        "A category with this name already exists",
      );
    }

    updateData.name = normalizedName;
  }

  if (updates.description !== undefined) {
    updateData.description = updates.description.trim();
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!category) {
    throw createError(404, "Category not found");
  }

  return category;
};

export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(
    categoryId,
  ).lean();

  if (!category) {
    throw createError(404, "Category not found");
  }

  return category;
};