import { z } from "zod";

export const categoryIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid category ID"),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Category description cannot exceed 500 characters")
    .optional(),
});

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(500, "Category description cannot exceed 500 characters")
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );
