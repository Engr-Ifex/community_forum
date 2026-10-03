import { z } from "zod";


export const userIdParamsSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});


export const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(500, "Bio cannot exceed 500 characters")
      .optional(),

    
    avatar: z
      .union([
        z.string().trim().url("Avatar must be a valid URL"),
        z.null(),
      ])
      .optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.bio !== undefined ||
      data.avatar !== undefined,
    { message: "Provide at least one field to update" },
  );