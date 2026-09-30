import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const moderationIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid ID"),
});

export const moderationReasonSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(1000, "Reason cannot exceed 1000 characters")
    .optional(),
});