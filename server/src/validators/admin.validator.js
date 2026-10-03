import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const adminUserIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid user ID"),
});

export const updateUserAdminSchema = z
  .object({
    role: z
      .enum(["user", "moderator", "admin"])
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .refine(
    (data) =>
      data.role !== undefined ||
      data.isActive !== undefined,
    {
      message: "Provide at least one field to update",
    },
  );