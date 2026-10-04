import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const discussionIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid discussion ID"),
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

/*
 * GET /discussions
 *
 * Supports:
 * ?search=KEYWORD
 * ?category=CATEGORY_ID
 * ?page=1
 * ?limit=10
 * ?sort=latest
 * ?sort=oldest
 * ?sort=popular
 */
export const discussionQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .max(200, "Search cannot exceed 200 characters")
    .optional(),

  category: z
    .string()
    .regex(objectIdRegex, "Invalid category ID")
    .optional(),

  page: z
    .coerce
    .number()
    .int("Page must be an integer")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z
    .coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),

  sort: z
    .enum(["latest", "oldest", "popular"], {
      error: "Sort must be latest, oldest, or popular",
    })
    .default("latest"),
});