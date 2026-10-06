/*
 * Responsive (mobile) verification.
 *
 * Pure static analysis of the source: no DOM, no rendering. It guards the
 * specific class-level mistakes that caused real mobile bugs, because a broken
 * breakpoint is invisible to lint and to the build.
 *
 *   1. No `shrink-0` on a row of buttons. `shrink-0` pins a flex item to its
 *      max-content width, so a two-button group refuses to shrink and pushes the
 *      second button out of its card on a narrow screen. This is exactly what
 *      happened to "Browse discussions" on the Dashboard.
 *   2. Wide tab strips must WRAP, not scroll. An `overflow-x-auto` row hides its
 *      right-hand tabs ("Reports", "Moderation log") on a phone with no visible
 *      affordance, so the user cannot tell they exist.
 *   3. Every grid must be mobile-first: a bare `grid-cols-N` forces N columns at
 *      every width, which crushes content on a phone. All of ours must be
 *      prefixed (`sm:` / `md:` / `lg:`).
 *   4. User-generated text must carry `break-words`. With `whitespace-pre-wrap`
 *      alone, one long unbroken string (a URL, a pasted token) overflows the
 *      container horizontally.
 *   5. Every `<table>` needs an `overflow-x-auto` ancestor, or the table blows
 *      the page width out on a phone.
 *
 * Run from client/:  node scripts/verify-responsive.mjs
 */
import fs from "node:fs";
import path from "node:path";

let failures = 0;

const check = (label, ok, detail = "") => {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok || !detail ? "" : `  (${detail})`}`);
};

/** Every .jsx file under src/, excluding the design-system module itself. */
const walk = (dir) => {
  const out = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".jsx")) out.push(full);
  }

  return out;
};

const files = walk(path.resolve("src/components")).concat(
  fs.existsSync(path.resolve("src/App.jsx")) ? [path.resolve("src/App.jsx")] : [],
);

const rel = (file) => path.relative(process.cwd(), file).replace(/\\/g, "/");

/*
 * Comments routinely mention the very classes this file forbids (explaining why
 * something was changed), so they must be removed before scanning or the checks
 * flag their own documentation.
 *
 * Block comments are blanked character-by-character except for newlines, so
 * reported line numbers still line up. JSX comments are wrapped in braces around
 * a normal block comment, so they are covered too.
 */
const stripComments = (source) =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, " "))
    .split("\n")
    .map((line) => (/^\s*\/\//.test(line) ? "" : line))
    .join("\n");

/* ------------------------------------------------------------------ */
/* 1. No `flex-wrap` + bare `shrink-0` on the same container          */
/* ------------------------------------------------------------------ */
console.log("=== 1. No flex-wrap + bare shrink-0 (contradictory pair) ===");

/*
 * `flex-wrap` says "wrap when space runs out"; a BARE `shrink-0` says "never
 * shrink below my max-content width". Together the wrap can never trigger, so
 * the container simply overflows its parent. This is the exact shape of the
 * Dashboard bug (`flex shrink-0 flex-wrap gap-2` holding two buttons), where
 * "Browse discussions" was pushed out of the card.
 *
 * A breakpoint-prefixed `sm:shrink-0` is fine: it only applies from the row
 * layout up, where the parent has room.
 */
const contradictory = [];

for (const file of files) {
  const source = stripComments(fs.readFileSync(file, "utf8"));

  source.split("\n").forEach((line, index) => {
    const hasBareShrink = /(?<![\w:-])shrink-0\b/.test(line);
    if (!hasBareShrink) return;
    if (!/\bflex-wrap\b/.test(line)) return;

    contradictory.push(`${rel(file)}:${index + 1}`);
  });
}

check(
  "no container combines flex-wrap with a bare shrink-0",
  contradictory.length === 0,
  contradictory.join(", "),
);

/* ------------------------------------------------------------------ */
/* 2. Wide tab strips wrap rather than scroll                         */
/* ------------------------------------------------------------------ */
console.log("\n=== 2. Admin tab strip wraps instead of scrolling ===");

const adminSource = stripComments(
  fs.readFileSync(path.resolve("src/components/Admin/Admin.jsx"), "utf8"),
);

check("Admin tab strip uses flex-wrap", /flex flex-wrap gap-2/.test(adminSource));
check(
  "Admin tab strip is not a horizontal scroller",
  !/overflow-x-auto/.test(adminSource),
);

/* ------------------------------------------------------------------ */
/* 3. Grids are mobile-first                                          */
/* ------------------------------------------------------------------ */
console.log("\n=== 3. Grids are mobile-first (no bare multi-column grid-cols-N) ===");

/*
 * `grid-cols-1` is the explicit mobile-first base and is correct; only a bare
 * `grid-cols-2+` forces multiple columns at every width.
 */
const bareGrids = [];

for (const file of files) {
  const source = stripComments(fs.readFileSync(file, "utf8"));

  source.split("\n").forEach((line, index) => {
    if (/(^|[^:\w-])grid-cols-[2-9]/.test(line)) {
      bareGrids.push(`${rel(file)}:${index + 1}`);
    }
  });
}

check(
  "every multi-column grid-cols-N is breakpoint-prefixed",
  bareGrids.length === 0,
  bareGrids.join(", "),
);

/* ------------------------------------------------------------------ */
/* 4. User-generated text can break long words                        */
/* ------------------------------------------------------------------ */
console.log("\n=== 4. Pre-wrapped user text also breaks words ===");

const missingBreak = [];

for (const file of files) {
  const source = stripComments(fs.readFileSync(file, "utf8"));

  source.split("\n").forEach((line, index) => {
    if (line.includes("whitespace-pre-wrap") && !line.includes("break-words")) {
      missingBreak.push(`${rel(file)}:${index + 1}`);
    }
  });
}

check(
  "every whitespace-pre-wrap block also has break-words",
  missingBreak.length === 0,
  missingBreak.join(", "),
);

/* ------------------------------------------------------------------ */
/* 5. Tables sit in a scroll container                                */
/* ------------------------------------------------------------------ */
console.log("\n=== 5. Tables are wrapped in overflow-x-auto ===");

const unwrappedTables = [];

for (const file of files) {
  const source = stripComments(fs.readFileSync(file, "utf8"));
  const tableCount = (source.match(/<table/g) ?? []).length;

  if (tableCount === 0) continue;

  const scrollCount = (source.match(/overflow-x-auto/g) ?? []).length;

  if (scrollCount < tableCount) {
    unwrappedTables.push(`${rel(file)} (${tableCount} table(s), ${scrollCount} scroller(s))`);
  }
}

check(
  "each table has an overflow-x-auto wrapper",
  unwrappedTables.length === 0,
  unwrappedTables.join(", "),
);

console.log(
  `\n${failures === 0 ? "ALL RESPONSIVE CHECKS PASSED" : `${failures} RESPONSIVE CHECK(S) FAILED`}`,
);
process.exit(failures === 0 ? 0 : 1);
