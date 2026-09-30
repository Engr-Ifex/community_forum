import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const discussionIdParamsSchema = z.object({
  id: z
    .string()
    .regex(objectIdRegex, "Invalid discussion ID"),
});

export const replyIdParamsSchema = z.object({
  id: z
    .string()
    .regex(objectIdRegex, "Invalid reply ID"),
});

export const createReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(5000, "Reply cannot exceed 5000 characters"),
});

export const updateReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Reply cannot be empty")
    .max(5000, "Reply cannot exceed 5000 characters"),
});
