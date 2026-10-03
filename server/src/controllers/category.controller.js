import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
} from "../services/category.service.js";

import {
  createdResponse,
  successResponse,
} from "../utils/apiResponse.js";

export const create = async (req, res) => {
  const category = await createCategory({
    ...req.body,
    createdBy: req.user.id,
  });

  return createdResponse(res, {
    message: "Category created successfully",
    data: { category },
  });
};

export const getAll = async (req, res) => {
  const categories = await getCategories();

  return successResponse(res, {
    message: "Categories retrieved successfully",
    data: { categories },
  });
};

export const getOne = async (req, res) => {
  const category = await getCategoryById(req.params.id);

  return successResponse(res, {
    message: "Category retrieved successfully",
    data: { category },
  });
};

export const update = async (req, res) => {
  const category = await updateCategory(
    req.params.id,
    req.body,
  );

  return successResponse(res, {
    message: "Category updated successfully",
    data: { category },
  });
};

export const remove = async (req, res) => {
  await deleteCategory(req.params.id);

  return successResponse(res, {
    message: "Category deleted successfully",
  });
};
