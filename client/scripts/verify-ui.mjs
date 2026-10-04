/*
 * UI verification.
 *
 * `react-dom/server` and `esbuild` are both already present (esbuild ships with
 * Vite), so the real components can be rendered to HTML without adding jsdom or
 * a test framework. This proves the parts that matter and are easy to get wrong:
 *
 *   - getInitials() produces the documented monograms;
 *   - getPreferredName() produces the greeting;
 *   - getNavItems() shows the correct links per role;
 *   - the avatar renders initials when there is no avatar URL, and an <img> when
 *     there is.
 *
 * Run from client/:  node scripts/verify-ui.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { getInitials, getPreferredName } from "../src/utils/name.js";

let failures = 0;

const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;

  console.log(
    `  ${ok ? "PASS" : "FAIL"}  ${label.padEnd(46)} ${
      ok ? "" : `got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`
    }`,
  );
};

/* ------------------------------------------------------------------ */
/* JSX + extension-less imports                                       */
/*                                                                     */
/* Application files use JSX and Vite-style extension-less imports     */
/* ("../common/ui"), which plain Node cannot resolve. Vite's own        */
/* transformWithOxc (already a dependency in Vite 8) strips the JSX,    */
/* and imports are rewritten to real file URLs. Nothing extra is        */
/* installed and no build step is added.                                */
/* ------------------------------------------------------------------ */

const { transformWithOxc } = await import("vite");

const outDir = path.resolve("node_modules/.cache/ui-harness");
fs.mkdirSync(outDir, { recursive: true });

/** Resolve an extension-less / directory specifier the way Vite would. */
const resolveSpecifier = (fromDir, spec) => {
  const base = path.resolve(fromDir, spec);
  const candidates = [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}/index.js`,
    `${base}/index.jsx`,
  ];

  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
};

/**
 * Transform one module (and, recursively, the relative modules it imports) into
 * plain ESM under the cache directory. Returns the cached file path.
 */
const buildModule = async (filePath, built = new Map()) => {
  const absolute = path.resolve(filePath);

  if (built.has(absolute)) return built.get(absolute);

  const relative = path.relative(process.cwd(), absolute).replace(/[/\\]/g, "_");
  const outFile = path.join(outDir, `${relative}.mjs`);

  built.set(absolute, outFile);

  const source = fs.readFileSync(absolute, "utf8");

  const result = await transformWithOxc(source, absolute, {
    lang: absolute.endsWith(".jsx") ? "jsx" : "js",
    jsx: { runtime: "automatic" },
    target: "esnext",
  });

  // Resolve each import to a real file, transforming it first.
  const importPattern = /(from\s*["'])([^"']+)(["'])/g;
  const specifiers = [...result.code.matchAll(importPattern)];

  const resolved = new Map();

  for (const [, , spec] of specifiers) {
    if (!spec.startsWith(".")) continue;

    const target = resolveSpecifier(path.dirname(absolute), spec);

    if (!target) {
      throw new Error(`Could not resolve "${spec}" from ${absolute}`);
    }

    resolved.set(spec, await buildModule(target, built));
  }

  const rewritten = result.code.replace(
    importPattern,
    (match, pre, spec, post) => {
      if (!spec.startsWith(".")) return match;

      const targetFile = resolved.get(spec);
      const rel = path.relative(outDir, targetFile).replace(/\\/g, "/");

      return `${pre}${rel.startsWith(".") ? rel : `./${rel}`}${post}`;
    },
  );

  fs.writeFileSync(outFile, rewritten);

  return outFile;
};

const navItemsUrl = pathToFileURL(
  await buildModule("src/components/layout/navItems.js"),
).href;

const avatarUrl = pathToFileURL(
  await buildModule("src/components/Profile/Avatar.jsx"),
).href;

const { getNavItems, NAV_ITEMS } = await import(navItemsUrl);
const { default: Avatar } = await import(avatarUrl);

/* ---------------------------------- */
/* getInitials()                      */
/* ---------------------------------- */
console.log("=== getInitials() ===");
check('"John Doe"', getInitials("John Doe"), "JD");
check('"John"', getInitials("John"), "J");
check('"Mary Jane Smith"', getInitials("Mary Jane Smith"), "MJ");
check('"Adesoji Ifeoluwapo"', getInitials("Adesoji Ifeoluwapo"), "AI");
check('"  spaced   out  "', getInitials("  spaced   out  "), "SO");
check('"o\'brien"', getInitials("o'brien"), "O");
check('"" (empty)', getInitials(""), "?");
check("null", getInitials(null), "?");
check("undefined", getInitials(undefined), "?");
// Numeric names are unusual but must not produce "?" - first letter of each of
// the first two words, which for "123 456" is "1" and "4".
check('"123 456"', getInitials("123 456"), "14");

console.log("\n=== getPreferredName() ===");
check("first name only", getPreferredName({ name: "Adesoji Ifeoluwapo" }), "Adesoji");
check("falls back to 'there'", getPreferredName({}), "there");
check("falls back to 'there' (null)", getPreferredName(null), "there");

console.log("\n=== getNavItems() by role ===");
const labels = (role) => getNavItems(role).map((i) => i.label);

check("user", labels("user"), [
  "Dashboard",
  "Discussions",
  "Categories",
  "My Discussions",
  "Profile",
]);
check("moderator", labels("moderator"), [
  "Dashboard",
  "Discussions",
  "Categories",
  "My Discussions",
  "Moderation",
  "Profile",
]);
check("admin", labels("admin"), [
  "Dashboard",
  "Discussions",
  "Categories",
  "My Discussions",
  "Moderation",
  "Admin",
  "Profile",
]);
check("unknown role falls back to user links", labels("nonsense"), labels("user"));
check("user does NOT see Admin", labels("user").includes("Admin"), false);
check("moderator does NOT see Admin", labels("moderator").includes("Admin"), false);
check(
  "every nav item has an absolute path",
  NAV_ITEMS.every((i) => typeof i.to === "string" && i.to.startsWith("/")),
  true,
);

console.log("\n=== Avatar rendering (react-dom/server) ===");
{
  const initialsHtml = renderToStaticMarkup(
    h(Avatar, { user: { name: "Adesoji Ifeoluwapo" }, size: "sm" }),
  );

  check("no avatar -> renders initials AI", initialsHtml.includes(">AI<"), true);
  check("no avatar -> no <img> tag", initialsHtml.includes("<img"), false);
  check("monogram is aria-hidden", initialsHtml.includes('aria-hidden="true"'), true);

  const imgHtml = renderToStaticMarkup(
    h(Avatar, {
      user: { name: "Adesoji Ifeoluwapo", avatar: "https://example.com/a.png" },
      size: "sm",
    }),
  );

  check("avatar present -> renders <img>", imgHtml.includes("<img"), true);
  check(
    "avatar present -> src is the stored URL",
    imgHtml.includes('src="https://example.com/a.png"'),
    true,
  );
  check(
    "avatar present -> alt carries the name",
    imgHtml.includes("Adesoji Ifeoluwapo"),
    true,
  );
  check("avatar present -> initials not rendered", imgHtml.includes(">AI<"), false);

  // An empty-string avatar (the API default) must fall through to initials.
  const emptyHtml = renderToStaticMarkup(
    h(Avatar, { user: { name: "John Doe", avatar: null }, size: "lg" }),
  );

  check("avatar=null -> falls back to initials JD", emptyHtml.includes(">JD<"), true);
}

console.log(`\n${failures === 0 ? "ALL UI CHECKS PASSED" : `${failures} UI CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
