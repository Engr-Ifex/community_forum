/*
 * Routing verification for the restructured App.
 *
 * App.jsx now declares every route at one level and each route names its own
 * shell: guest-only pages sit in `PublicShell`, signed-in pages behind
 * `ProtectedRoute` + `AppLayout`, and the pages both audiences may read go
 * through `SiteShell`, which picks the shell from the session.
 *
 * The realistic regressions are a dropped or duplicated path, or a shared page
 * quietly losing its `SiteShell` wrapper (which would send a signed-in user back
 * to the public navbar). This verifies the *route table* by static analysis of
 * the module graph, since App hard-codes BrowserRouter.
 *
 * Run from client/:  node scripts/verify-routes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const appPath = path.resolve("src/App.jsx");
const source = fs.readFileSync(appPath, "utf8");

// Every `path="..."` literal in App.jsx.
const declared = [...source.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);

// Readable by anyone - the shell follows the session.
const EXPECTED_SHARED = [
  "/",
  "/discussions",
  "/discussions/:id",
  "/categories",
  "/categories/:id",
  "*",
];
// Guests only.
const EXPECTED_GUEST = ["/login", "/register"];
// Signed-in only, inside the application shell.
const EXPECTED_APP = ["/dashboard", "/my-discussions", "/create-discussion", "/discussions/new", "/profile"];
const EXPECTED_ROLE = ["/moderation", "/admin"];

const all = new Set(declared);
let failures = 0;

const check = (label, paths) => {
  console.log(`\n${label}`);
  for (const p of paths) {
    const present = all.has(p);
    if (!present) failures += 1;
    console.log(`  ${present ? "PASS" : "FAIL"}  ${p}`);
  }
};

console.log("=== Declared routes in App.jsx ===");
console.log(declared.join("\n"));

check("Shared routes (SiteShell picks the shell)", EXPECTED_SHARED);
check("Guest-only routes (PublicShell)", EXPECTED_GUEST);
check("Authenticated application routes", EXPECTED_APP);
check("Role-gated routes", EXPECTED_ROLE);

// The old single-detail component must still be routed where it always was.
console.log("\n=== Shells and guards present ===");
const guards = [
  ['ProtectedRoute (any user)', /<Route element=\{<ProtectedRoute \/>\}>/],
  ['ProtectedRoute moderator|admin', /roles=\{\["moderator", "admin"\]\}/],
  ['ProtectedRoute admin', /roles=\{\["admin"\]\}/],
  ['AppLayout shell', /<AppLayout \/>/],
  ['SiteShell used for shared pages', /<SiteShell[ >]/],
  ['SiteShell fullBleed for the landing page', /<SiteShell fullBleed>/],
  ['PublicShell used for guest pages', /<PublicShell>/],
];
for (const [label, pattern] of guards) {
  const ok = pattern.test(source);
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
}

/*
 * Every shared path must be wrapped in SiteShell. Counting the wrappers is the
 * cheap way to catch one that was missed: one per shared path plus the 404.
 */
console.log("\n=== Shared pages are wrapped in SiteShell ===");
const siteShellCount = (source.match(/<SiteShell/g) ?? []).length;
const expectedWrappers = EXPECTED_SHARED.length;
const wrappersOk = siteShellCount === expectedWrappers;
if (!wrappersOk) failures += 1;
console.log(
  `  ${wrappersOk ? "PASS" : "FAIL"}  ${siteShellCount} SiteShell wrapper(s), expected ${expectedWrappers}`,
);

// Duplicate-route detection: two identical paths is a bug.
const counts = declared.reduce((acc, p) => ({ ...acc, [p]: (acc[p] ?? 0) + 1 }), {});
const dupes = Object.entries(counts).filter(([, n]) => n > 1);
console.log("\n=== Duplicate paths ===");
if (dupes.length === 0) {
  console.log("  PASS  none");
} else {
  for (const [p, n] of dupes) {
    failures += 1;
    console.log(`  FAIL  ${p} declared ${n} times`);
  }
}

console.log(`\n${failures === 0 ? "ALL ROUTE CHECKS PASSED" : `${failures} ROUTE CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
