import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const discussionIdParamsSchema = z.object({
  id: z
    .string()
    .regex(objectIdRegex, "Invalid discussion ID"),
});

export const createDiscussionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Discussion title must be at least 3 characters")
    .max(200, "Discussion title cannot exceed 200 characters"),

  content: z
    .string()
    .trim()
    .min(10, "Discussion content must be at least 10 characters")
    .max(10000, "Discussion content cannot exceed 10000 characters"),

  category: z
    .string()
    .regex(objectIdRegex, "Invalid category ID"),
});

export const updateDiscussionSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Discussion title must be at least 3 characters")
      .max(200, "Discussion title cannot exceed 200 characters")
      .optional(),

    content: z
      .string()
      .trim()
      .min(10, "Discussion content must be at least 10 characters")
      .max(10000, "Discussion content cannot exceed 10000 characters")
      .optional(),

    category: z
      .string()
      .regex(objectIdRegex, "Invalid category ID")
      .optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.category !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );
