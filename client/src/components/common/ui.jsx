/**
 * Shared button styling.
 *
 * Exported as a plain function rather than a component so callers can keep
 * using `<Link>`, `<button>`, or `<a>` - React Router's `<Link>` cannot be
 * wrapped in a component that swallows its props without extra plumbing.
 *
 * Variants:
 *   primary  - the one loud accent action (blue-600). Every primary action in
 *              the app uses this: Login, Register, Create/Start a discussion,
 *              Save, Post reply, Create account, Create category.
 *   secondary- neutral outline for the quieter of a pair.
 *   ghost    - text-only, for tertiary actions.
 *   danger   - destructive actions (Delete, Remove, Deactivate). Still built on
 *              the site's own language: same radius/size/transition as primary,
 *              only the hue changes to signal risk.
 *
 * IMPORTANT: do NOT pass a `bg-*` or `text-*` in `extra` to override a variant
 * colour. In Tailwind v4 the generated rule order for utilities is fixed by
 * internal property order, not by the order they appear in the class string, so
 * `buttonClass("primary", "lg", "bg-white")` emits *both* `bg-blue-600` and
 * `bg-white` and the winner is decided by Tailwind, not by us - which is exactly
 * how a white-on-white CTA button happens. For an inverse/dark-surface button,
 * compose the classes directly instead of extending a variant (see FinalCta).
 */
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 " +
  "disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const VARIANTS = {
  primary: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50 focus-visible:outline-red-600",
};

const SIZES = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
  sm: "px-3.5 py-2 text-sm",
};

export const buttonClass = (variant = "primary", size = "md", extra = "") =>
  [BASE, VARIANTS[variant] ?? VARIANTS.primary, SIZES[size] ?? SIZES.md, extra]
    .filter(Boolean)
    .join(" ");

/**
 * Inverse button set, for use on the one dark surface (`FinalCta`'s slate-900
 * panel). Deliberately NOT built on `buttonClass`: these need their own
 * background/text colours, and mixing them through the variant helper is the
 * collision described above.
 */
export const inverseButtonClass = (variant = "solid", size = "lg", extra = "") => {
  const shell =
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white " +
    "active:scale-[0.98]";

  const skins = {
    // Solid white pill on the dark panel - the single loud action.
    solid: "bg-white text-slate-900 shadow-sm hover:bg-slate-100",
    // Outlined equivalent, legible against slate-900.
    outline:
      "border border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10",
  };

  const sizes = {
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3.5 py-2 text-sm",
  };

  return [shell, skins[variant] ?? skins.solid, sizes[size] ?? sizes.lg, extra]
    .filter(Boolean)
    .join(" ");
};

/**
 * Form controls.
 *
 * One definition of the input look for the whole app - border, radius,
 * background, text colour, placeholder, focus ring and disabled state. Matches
 * the treatment the Home page's search/filter controls established.
 *
 * `hasError` swaps the border + ring to the red pair used by every form's
 * field-level validation message.
 */
const FIELD_BASE =
  "w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 " +
  "outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70";

const FIELD_IDLE = "border-slate-300 bg-white focus:border-blue-600 focus:ring-blue-100";
const FIELD_ERROR = "border-red-400 bg-white focus:border-red-500 focus:ring-red-100";

export const inputClass = (hasError = false, extra = "") =>
  [FIELD_BASE, hasError ? FIELD_ERROR : FIELD_IDLE, extra].filter(Boolean).join(" ");

/** A `<select>` needs the same look plus an explicit white background. */
export const selectClass = (hasError = false, extra = "") =>
  inputClass(hasError, ["bg-white", extra].filter(Boolean).join(" "));

/** A `<textarea>`; callers add `resize-y` / row height themselves. */
export const textareaClass = (hasError = false, extra = "") =>
  inputClass(hasError, ["resize-y", extra].filter(Boolean).join(" "));

/** Standard form label. */
export const labelClass = "block text-sm font-medium text-slate-700";

/** Small muted helper / hint text under a control. */
export const hintClass = "text-xs text-slate-500";

/** Field-level validation message. */
export const fieldErrorClass = "text-xs text-red-700";

/**
 * Surface / layout primitives, so "what a card looks like" is defined once.
 */
/** The standard content card (Home's tiles & discussion cards). */
export const cardClass = (extra = "") =>
  ["rounded-xl border border-slate-200 bg-white shadow-sm", extra]
    .filter(Boolean)
    .join(" ");

/** An interactive card that lifts on hover (Home's category tile). */
export const cardLinkClass = (extra = "") =>
  [
    "group rounded-xl border border-slate-200 bg-white p-5 transition",
    "hover:border-blue-300 hover:shadow-md",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
    extra,
  ]
    .filter(Boolean)
    .join(" ");

/** Page title + supporting line, identical on every page. */
export const pageTitleClass =
  "text-3xl font-bold tracking-tight text-slate-900";

export const pageSubtitleClass = "mt-2 text-slate-600";

/** Section heading inside a page (smaller than the page title). */
export const sectionTitleClass = "text-xl font-semibold text-slate-900";


/**
 * Inline SVG icon set.
 *
 * Hand-rolled rather than pulled from an icon package: the project has no icon
 * dependency and the spec forbids adding one, so a small local set keeps the
 * bundle free of a new runtime and avoids shipping 1000 unused glyphs.
 */
export const icons = {
  chat: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 21l1.9-4.6A8.4 8.4 0 0 1 4 11.5 8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5Z" />
    </svg>
  ),
  users: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7" r="3.4" />
      <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16.5 3.6a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  grid: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6" />
    </svg>
  ),
  shield: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 22s8-3.6 8-9.6V5.6L12 2.6 4 5.6v6.8C4 18.4 12 22 12 22Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  eye: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  ),
  arrowRight: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  plus: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  menu: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  close: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  spark: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </svg>
  ),
  flag: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M5 21V4" />
      <path d="M5 4.5h11.5l-1.8 3.6 1.8 3.6H5" />
    </svg>
  ),
  check: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  ),
  lock: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  ),
  trash: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 6.5h16M9.5 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </svg>
  ),
};

/**
 * Skeleton block used by the Home page loading states.
 * `animate-pulse` is a pure-opacity animation, so it stays on the compositor.
 */
export const Skeleton = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-slate-200/80 ${className}`}
  />
);

/**
 * A skeleton shaped like the standard content card, so every loading list
 * (discussions, categories, reports) reserves the same space and settles the
 * same way. `lines` controls how many body bars to draw.
 */
export const CardSkeleton = ({ lines = 2, className = "" }) => (
  <div className={cardClass(["p-5", className].filter(Boolean).join(" "))}>
    <Skeleton className="h-5 w-28 rounded-full" />
    <Skeleton className="mt-3 h-5 w-3/4" />

    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        className={index === lines - 1 ? "mt-2 h-4 w-2/3" : "mt-2 h-4 w-full"}
      />
    ))}
  </div>
);

/** A column of card skeletons - the default loading state for a list page. */
export const CardSkeletonList = ({ count = 4, lines = 2 }) => (
  <div className="space-y-4" aria-hidden="true">
    {Array.from({ length: count }, (_, index) => (
      <CardSkeleton key={index} lines={lines} />
    ))}
  </div>
);

/**
 * Success / informational banner.
 *
 * One component for the notice pattern that every page repeats (create, edit,
 * delete and report confirmations). `tone` covers the two in use:
 *   success (default) - an action completed.
 *   info              - a neutral explanation the user should read.
 *
 * Dismissal is optional: pass `onDismiss` to render the close control.
 */
export const Notice = ({ children, tone = "success", onDismiss, className = "" }) => {
  const TONES = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  };

  return (
    <div
      role="status"
      className={[
        "flex items-start justify-between gap-3 rounded-lg border p-4 text-sm",
        TONES[tone] ?? TONES.success,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* `min-w-0` so a long unbroken string (an email, a URL) wraps inside the
          banner instead of forcing the dismiss button off the edge. */}
      <span className="min-w-0 break-words">{children}</span>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 rounded p-0.5 transition hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        >
          ×
        </button>
      ) : null}
    </div>
  );
};

/**
 * Empty state: an icon well, a heading, an explanation and an optional action.
 * Used wherever a list legitimately has nothing to show, so the "nothing here"
 * moment looks the same on Discussions, Categories, Profile and Moderation.
 */
export const EmptyState = ({
  icon: Icon,
  title,
  description,
  children,
  className = "",
}) => (
  <div
    className={[
      "rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {Icon ? (
      <span
        aria-hidden="true"
        className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"
      >
        <Icon className="h-5 w-5" />
      </span>
    ) : null}

    <h2 className="mt-4 font-semibold text-slate-900">{title}</h2>

    {description ? (
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{description}</p>
    ) : null}

    {children ? <div className="mt-5">{children}</div> : null}
  </div>
);

/**
 * Error state: a readable message plus a retry affordance.
 *
 * `message` is expected to be a friendly sentence; pages should not surface raw
 * backend payloads. The optional `detail` is for the underlying reason when it
 * is genuinely useful, kept visually subordinate.
 */
export const ErrorState = ({
  title = "Something went wrong",
  message,
  detail,
  onRetry,
  retryLabel = "Try again",
  children,
  className = "",
}) => (
  <div
    role="alert"
    className={[
      "rounded-xl border border-red-200 bg-red-50 p-6 text-red-800",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <p className="font-semibold text-red-900">{title}</p>

    {message ? <p className="mt-1 text-sm text-red-800">{message}</p> : null}

    {detail ? <p className="mt-1 text-xs text-red-700/80">{detail}</p> : null}

    <div className="mt-4 flex flex-wrap items-center gap-3">
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={buttonClass("secondary", "sm")}
        >
          {retryLabel}
        </button>
      ) : null}

      {children}
    </div>
  </div>
);

/**
 * Page header: a title, an optional supporting line and an optional right-hand
 * action slot. Every page uses this so the jump from Home -> Discussions ->
 * Categories -> Admin always lands on the same title treatment.
 */
export const PageHeader = ({ title, description, children, className = "" }) => (
  <div
    className={[
      "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    <div className="min-w-0">
      <h1 className={pageTitleClass}>{title}</h1>

      {description ? (
        <p className={pageSubtitleClass}>{description}</p>
      ) : null}
    </div>

    {children ? (
      // `sm:shrink-0` only from the row layout up. On mobile the header is a
      // column, so the action group already gets the full width - pinning it
      // there would be a no-op at best and an overflow at worst.
      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{children}</div>
    ) : null}
  </div>
);


