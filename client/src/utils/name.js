/**
 * Name helpers.
 *
 * `getInitials` is the single source of truth for monograms across the app -
 * the navbar avatar, the profile header and the discussion cards all render the
 * same letters for the same person.
 *
 * Rules (kept deliberately simple and consistent):
 *   "John Doe"        -> JD
 *   "John"            -> J
 *   "mary jane smith" -> MJ   (first + last of the first two words)
 *   "Adesoji Ifeoluwapo" -> AI
 *   ""                -> "?"
 *
 * Only the first two words contribute, which keeps a long name from collapsing
 * into a 4-letter block. Non-alphanumeric characters are ignored so a name like
 * "O'Brien" yields "O" rather than a quote mark.
 */
export const getInitials = (name) => {
  if (typeof name !== "string") return "?";

  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";

  const letters = words
    .slice(0, 2)
    .map((word) => {
      const match = word.match(/[a-z0-9]/i);

      return match ? match[0] : "";
    })
    .filter(Boolean);

  return letters.length ? letters.join("").toUpperCase() : "?";
};

/**
 * The short name used in greetings ("Welcome back, Ifeoluwapo").
 * Falls back to the full name, then to a neutral word.
 */
export const getPreferredName = (user) => {
  const name = typeof user?.name === "string" ? user.name.trim() : "";

  if (!name) return "there";

  // Prefer the *first* name for a greeting - it reads more naturally.
  return name.split(/\s+/)[0];
};
