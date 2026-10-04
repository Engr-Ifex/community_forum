import { useEffect, useState } from "react";

import { getInitials } from "../../utils/name";

/**
 * Avatar with an initials fallback.
 *
 * The backend stores the avatar as a URL string and does not verify it is
 * reachable, so a broken image is a realistic state. `onError` swaps to the
 * monogram rather than leaving the browser's broken-image glyph in the layout.
 *
 * Sizes:
 *   lg (default) - the profile header, rounded square.
 *   sm           - the navbar trigger, small circle.
 */
const SIZE_STYLES = {
  lg: "h-20 w-20 text-2xl rounded-2xl",
  sm: "h-10 w-10 text-sm rounded-full",
  xs: "h-8 w-8 text-xs rounded-full",
};

const Avatar = ({ user, size = "lg", className = "" }) => {
  const [failed, setFailed] = useState(false);

  const src = user?.avatar ?? null;
  const name = user?.name ?? "";

  // A new URL deserves a fresh attempt.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const dimensions = SIZE_STYLES[size] ?? SIZE_STYLES.lg;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${name || "User"}'s avatar`}
        onError={() => setFailed(true)}
        className={`${dimensions} shrink-0 border border-slate-200 bg-slate-100 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${dimensions} grid shrink-0 place-items-center bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white ${className}`}
    >
      {getInitials(name)}
    </span>
  );
};

export default Avatar;
