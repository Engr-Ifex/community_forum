/*
 * Full-tree render verification.
 *
 * Renders the real routed component trees to static HTML with a stubbed auth
 * context and API layer. This catches runtime faults that a build cannot: a bad
 * hook call, a missing guard, a crash in the layout, or the sidebar simply not
 * rendering the right links for a role.
 *
 * Run from client/:  node scripts/verify-render.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement as h, createContext } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const { transformWithOxc } = await import("vite");

let failures = 0;

const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;

  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${actual}, want ${expected})`}`);
};

/* ------------------------------------------------------------------ */
/* Module transform with aliasing                                      */
/* ------------------------------------------------------------------ */

const outDir = path.resolve("node_modules/.cache/render-harness");
fs.mkdirSync(outDir, { recursive: true });

// Set by the block below once the stub file exists; consulted by every module
// build so the stub is applied globally, not just to the entry module.
let authStubFile = null;

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
 * Replace certain modules entirely (the auth context and the API services) so
 * the tree can render without a server or a live session.
 */
const OVERRIDES = {
  "src/context/AuthContext": "src/context/AuthContext.stub",
};

const buildModule = async (filePath, built = new Map(), aliases = {}) => {
  const absolute = path.resolve(filePath);

  if (built.has(absolute)) return built.get(absolute);

  const tag = path.relative(process.cwd(), absolute).replace(/[/\\]/g, "_");
  const outFile = path.join(outDir, `${tag}.mjs`);

  built.set(absolute, outFile);

  const source = fs.readFileSync(absolute, "utf8");

  const result = await transformWithOxc(source, absolute, {
    lang: absolute.endsWith(".jsx") ? "jsx" : "js",
    jsx: { runtime: "automatic" },
    target: "esnext",
  });

  const importPattern = /(from\s*["'])([^"']+)(["'])/g;
  const resolved = new Map();

  for (const [, , spec] of result.code.matchAll(importPattern)) {
    if (!spec.startsWith(".")) continue;

    const target = resolveSpecifier(path.dirname(absolute), spec);

    if (!target) throw new Error(`Could not resolve "${spec}" from ${absolute}`);

    // Any module that imports the auth context gets the stub, at every level of
    // the graph - otherwise only the entry module is stubbed and a nested
    // component still calls the real useAuth().
    if (
      authStubFile &&
      (target.endsWith("AuthContext.jsx") || target.endsWith("AuthContext.js"))
    ) {
      resolved.set(spec, authStubFile);
      continue;
    }

    resolved.set(spec, await buildModule(target, built, aliases));
  }

  const rewritten = result.code.replace(importPattern, (match, pre, spec, post) => {
    if (!spec.startsWith(".")) return match;

    const rel = path.relative(outDir, resolved.get(spec)).replace(/\\/g, "/");

    return `${pre}${rel.startsWith(".") ? rel : `./${rel}`}${post}`;
  });

  fs.writeFileSync(outFile, withEnvShim(rewritten));

  return outFile;
};

/* ------------------------------------------------------------------ */
/* Stubs                                                               */
/* ------------------------------------------------------------------ */

// A real AuthContext whose value we control, so components use the genuine
// useAuth() contract rather than a fake hook.
const authStubPath = path.join(outDir, "__auth-stub.mjs");

const authStubSource = `
import { createContext, useContext } from "react";

export const __authValue = { current: null };
const Ctx = createContext();

export const AuthProvider = ({ children }) => children;
export const useAuth = () => __authValue.current ?? { user: null, isAuthenticated: false, loading: false, role: null, login: async () => {}, register: async () => {}, logout: async () => {}, refreshUser: async () => {} };
export default Ctx;
`;

fs.writeFileSync(authStubPath, authStubSource);

// From here on, every module that imports the auth context resolves to the stub.
authStubFile = authStubPath;

/*
 * Vite injects `import.meta.env` at build time; plain Node has no such object,
 * so any module touching it throws on import. The transform rewrites
 * `import.meta.env` to a shimmed global and prepends the assignment with the
 * values Vite would have provided.
 */
const ENV_SHIM = `globalThis.__VITE_ENV__ = { VITE_API_URL: "http://127.0.0.1:5000/api/v1", DEV: false, PROD: false, MODE: "test" };\n`;

/** Point `import.meta.env` at the shim, and make sure the shim exists. */
const withEnvShim = (code) =>
  code.includes("import.meta.env")
    ? ENV_SHIM + code.replace(/import\.meta\.env/g, "globalThis.__VITE_ENV__")
    : code;

/* ------------------------------------------------------------------ */
/* Render the sidebar for each role                                    */
/* ------------------------------------------------------------------ */
console.log("=== Sidebar link rendering per role ===");

// Sidebar imports useAuth; alias that import to the stub.
const { default: Sidebar } = await import(
  pathToFileURL(await buildAliased("src/components/layout/Sidebar.jsx")).href
);

/**
 * Build a JSX entry module. The auth-context aliasing is applied by
 * `buildModule` for the whole graph, so this only needs to transform the entry
 * itself and delegate every relative import.
 */
async function buildAliased(filePath) {
  const absolute = path.resolve(filePath);
  const tag = path.relative(process.cwd(), absolute).replace(/[/\\]/g, "_");
  const outFile = path.join(outDir, `${tag}.aliased.mjs`);

  const source = fs.readFileSync(absolute, "utf8");

  const result = await transformWithOxc(source, absolute, {
    lang: "jsx",
    jsx: { runtime: "automatic" },
    target: "esnext",
  });

  const importPattern = /(from\s*["'])([^"']+)(["'])/g;
  const resolved = new Map();

  for (const [, , spec] of result.code.matchAll(importPattern)) {
    if (!spec.startsWith(".")) continue;

    const target = resolveSpecifier(path.dirname(absolute), spec);

    if (!target) throw new Error(`Could not resolve "${spec}" from ${absolute}`);

    if (target.endsWith("AuthContext.jsx") || target.endsWith("AuthContext.js")) {
      resolved.set(spec, authStubFile);
    } else {
      resolved.set(spec, await buildModule(target));
    }
  }

  const rewritten = result.code.replace(importPattern, (match, pre, spec, post) => {
    if (!spec.startsWith(".")) return match;

    const rel = path.relative(outDir, resolved.get(spec)).replace(/\\/g, "/");

    return `${pre}${rel.startsWith(".") ? rel : `./${rel}`}${post}`;
  });

  fs.writeFileSync(outFile, withEnvShim(rewritten));

  return outFile;
}

// Sidebar also uses react-router's NavLink/useNavigate - render inside a router.
const { MemoryRouter } = await import("react-router-dom");
const { __authValue } = await import(pathToFileURL(authStubPath).href);

const roleCases = [
  ["user", ["Dashboard", "Discussions", "Categories", "My Discussions", "Profile"]],
  ["moderator", ["Dashboard", "Discussions", "Categories", "My Discussions", "Moderation", "Profile"]],
  ["admin", ["Dashboard", "Discussions", "Categories", "My Discussions", "Moderation", "Admin", "Profile"]],
];

for (const [role, expected] of roleCases) {
  __authValue.current = {
    user: { _id: "u1", name: "Test Person", email: "t@example.com", role },
    isAuthenticated: true,
    loading: false,
    role,
    logout: async () => {},
  };

  const html = renderToStaticMarkup(
    h(MemoryRouter, { initialEntries: ["/dashboard"] }, h(Sidebar)),
  );

  for (const label of expected) {
    check(`${role} sidebar shows "${label}"`, html.includes(`>${label}</a>`) || html.includes(`>${label}<`), true);
  }

  // The role a user must NOT have must be absent.
  if (role === "user") {
    check('user sidebar hides "Moderation"', html.includes(">Moderation<"), false);
    check('user sidebar hides "Admin"', html.includes(">Admin<"), false);
  }

  if (role === "moderator") {
    check('moderator sidebar hides "Admin"', html.includes(">Admin<"), false);
    check('moderator sidebar shows "Moderation"', html.includes(">Moderation<"), true);
  }
}

/* ------------------------------------------------------------------ */
/* Render the AppLayout for an admin                                   */
/* ------------------------------------------------------------------ */
console.log("\n=== AppLayout renders (admin) ===");
{
  const { default: AppLayout } = await import(
    pathToFileURL(await buildAliased("src/components/layout/AppLayout.jsx")).href
  );

  __authValue.current = {
    user: { _id: "u1", name: "Admin Person", email: "a@example.com", role: "admin" },
    isAuthenticated: true,
    loading: false,
    role: "admin",
    logout: async () => {},
  };

  let html = "";
  let threw = null;

  try {
    html = renderToStaticMarkup(
      h(
        MemoryRouter,
        { initialEntries: ["/dashboard"] },
        h(
          (await import("react-router-dom")).Routes,
          null,
          h((await import("react-router-dom")).Route, {
            element: h(AppLayout),
            children: h((await import("react-router-dom")).Route, {
              path: "/dashboard",
              element: h("p", null, "DASHBOARD CONTENT"),
            }),
          }),
        ),
      ),
    );
  } catch (error) {
    threw = error;
  }

  check("AppLayout renders without throwing", threw === null, true);

  if (threw) {
    console.log(`        ${threw.message}`);
  } else {
    check("top bar shows the brand", html.includes("Community Forum"), true);
    check("avatar trigger is present", html.includes('aria-label="Account menu"'), true);
    check("renders the routed content", html.includes("DASHBOARD CONTENT"), true);
    check("does NOT render the public footer", html.includes("<footer"), false);
    check("renders the sidebar aside", html.includes("<aside"), true);
    check("has a mobile drawer toggle", html.includes('aria-controls="app-drawer"'), true);
    check("full name is NOT in the top bar", html.includes("Admin Person"), false);
  }
}

console.log(`\n${failures === 0 ? "ALL RENDER CHECKS PASSED" : `${failures} RENDER CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
