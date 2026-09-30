import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const reportIdParamsSchema = z.object({
  id: z.string().regex(objectIdRegex, "Invalid report ID"),
});

export const createReportSchema = z
  .object({
    discussion: z
      .string()
      .regex(objectIdRegex, "Invalid discussion ID")
      .optional(),

    reply: z
      .string()
      .regex(objectIdRegex, "Invalid reply ID")
      .optional(),

    reason: z
      .string()
      .trim()
      .min(3, "Report reason must be at least 3 characters")
      .max(1000, "Report reason cannot exceed 1000 characters"),
  })
  .refine(
    (data) => {
      const hasDiscussion = data.discussion !== undefined;
      const hasReply = data.reply !== undefined;

      return hasDiscussion !== hasReply;
    },
    {
      message: "Provide either a discussion or a reply to report",
    },
  );