/**
 * Small formatting helpers shared by the admin sections.
 *
 * Kept in one place so every table and card renders dates and labels the same
 * way, instead of each section inventing its own variant.
 */

export const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
};

/**
 * Human-readable labels for the `ModerationAction.action` enum.
 *
 * The backend stores snake_case identifiers; the log reads better with spaces.
 */
export const MODERATION_ACTION_LABELS = {
  remove_discussion: "Removed discussion",
  remove_reply: "Removed reply",
  lock_discussion: "Locked discussion",
  dismiss_report: "Dismissed report",
  resolve_report: "Resolved report",
};

export const moderationActionLabel = (action) =>
  MODERATION_ACTION_LABELS[action] ?? String(action ?? "").replace(/_/g, " ");

/** Truncate long free text for table cells. */
export const truncate = (value, max = 120) => {
  if (!value) return "";

  const text = String(value);

  return text.length > max ? `${text.slice(0, max)}…` : text;
};
