/*
 * Public vs authenticated shell resolution.
 *
 * Shared pages (`/`, `/discussions`, `/categories`, their detail pages, 404) are
 * readable by everyone, so the SHELL - not the route - is what depends on the
 * session. `SiteShell` picks it:
 *
 *   guest         -> PublicShell : marketing navbar + footer, no sidebar
 *   authenticated -> AppLayout   : top bar + sidebar, no public footer
 *
 * That is what keeps a sidebar click on Discussions/Categories inside the
 * application instead of dropping the user back onto the public navbar.
 *
 * This renders the real App component (auth context stubbed, network services
 * mocked) once per starting URL and asserts which shell came out.
 *
 * Run from client/:  node scripts/verify-shells.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/*
 * App.jsx hard-codes <BrowserRouter>, which reads `document`/`window` at module
 * scope. Rather than stub the router (which would defeat the point of rendering
 * the real App), provide the small slice of the DOM that history creation
 * touches. Enough for a static render, not a full DOM implementation.
 */
const installDomShim = () => {
  if (globalThis.document) return;

  const listeners = new Map();

  const location = {
    href: "http://localhost/",
    origin: "http://localhost",
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
    assign() {},
    replace() {},
    toString: () => "http://localhost/",
  };

  const history = {
    state: null,
    length: 1,
    pushState(state, _title, url) {
      this.state = state;
      location.href = new URL(String(url), location.href).href;
      location.pathname = new URL(location.href).pathname;
      location.search = new URL(location.href).search;
      location.hash = new URL(location.href).hash;
    },
    replaceState(state, _title, url) {
      this.pushState(state, _title, url);
    },
    go() {},
    back() {},
    forward() {},
  };

  globalThis.document = {
    defaultView: globalThis,
    location,
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }),
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
    querySelector: () => null,
    getElementById: () => null,
  };

  globalThis.window = globalThis;
  globalThis.history = history;
  globalThis.location = location;
  globalThis.addEventListener = (type, handler) => listeners.set(type, handler);
  globalThis.removeEventListener = (type) => listeners.delete(type);
  // `navigator` already exists as a read-only getter on modern Node; leave it.
};

installDomShim();

const { transformWithOxc } = await import("vite");

let failures = 0;

const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `  (got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)})`}`);
};

const outDir = path.resolve("node_modules/.cache/shell-harness");
// Re-create without rmSync: the sandbox shim intercepts recursive deletes and
// routes them to the OS trash, which is slow and unnecessary here.
fs.mkdirSync(outDir, { recursive: true });

const resolveSpecifier = (fromDir, spec) => {
  const base = path.resolve(fromDir, spec);
  for (const c of [base, `${base}.js`, `${base}.jsx`, `${base}/index.js`, `${base}/index.jsx`]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
};

const ENV_SHIM = `globalThis.__VITE_ENV__ = { VITE_API_URL: "http://127.0.0.1:5000/api/v1" };\n`;
const withEnvShim = (code) =>
  code.includes("import.meta.env")
    ? ENV_SHIM + code.replace(/import\.meta\.env/g, "globalThis.__VITE_ENV__")
    : code;

/* --- auth stub (controls the session) ------------------------------ */
const authStubPath = path.join(outDir, "__auth-stub.mjs");
fs.writeFileSync(
  authStubPath,
  `export const __authValue = { current: null };
export const AuthProvider = ({ children }) => children;
export const useAuth = () => __authValue.current;
export default null;`,
);

/* --- service stub (kills network calls) ---------------------------- */
const serviceStubDir = path.join(outDir, "__services__");
fs.mkdirSync(serviceStubDir, { recursive: true });

/**
 * Build a stub for a real service module by parsing its exported names, so the
 * stub always matches the real module's shape. Hand-writing these rots the
 * moment a service gains an export, which is exactly what happened while this
 * script was being written.
 *
 * Every export becomes a function resolving to the same inert envelope, except
 * `getFieldErrors`, which is a pure helper and keeps its real behaviour.
 */
const SERVICES = [
  "discussions",
  "categories",
  "users",
  "auth",
  "admin",
  "reports",
  "moderation",
  "replies",
];

const buildServiceStub = (name) => {
  const realPath = path.resolve(`src/services/${name}.js`);
  const source = fs.readFileSync(realPath, "utf8");

  const names = [...source.matchAll(/export\s+const\s+([A-Za-z0-9_$]+)/g)].map((m) => m[1]);

  const body = names
    .map((fn) =>
      fn === "getFieldErrors"
        ? `export const ${fn} = () => ({});`
        : `export const ${fn} = () => Promise.resolve({ success: true, message: "", data: { discussions: [], categories: [], users: [], reports: [], replies: [], user: {}, pagination: {} } });`,
    )
    .join("\n");

  // `getFieldErrors` is a plain helper, not a request - it must exist for form
  // components that call it during render.
  const withHelper = names.includes("getFieldErrors")
    ? body
    : `${body}\nexport const getFieldErrors = () => ({});`;

  fs.writeFileSync(path.join(serviceStubDir, `${name}.js`), withHelper);

  return path.join(serviceStubDir, `${name}.js`);
};

const SERVICE_ALIASES = Object.fromEntries(
  SERVICES.map((name) => [`services/${name}`, buildServiceStub(name)]),
);

// The axios client itself is never reached, but a module-level import still has
// to resolve and expose a default export.
fs.writeFileSync(
  path.join(serviceStubDir, "api.js"),
  `const api = { get: () => Promise.resolve({}), post: () => Promise.resolve({}), patch: () => Promise.resolve({}), delete: () => Promise.resolve({}) };\nexport default api;\nexport class ApiError extends Error {}\n`,
);

SERVICE_ALIASES["services/api"] = path.join(serviceStubDir, "api.js");

const built = new Map();

const buildModule = async (filePath) => {
  const absolute = path.resolve(filePath);
  if (built.has(absolute)) return built.get(absolute);

  const outFile = path.join(
    outDir,
    path.relative(process.cwd(), absolute).replace(/[/\\]/g, "_") + ".mjs",
  );
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

    // Redirect the auth context and the network services to stubs.
    const normalized = spec.replace(/\.jsx?$/, "");
    const target = resolveSpecifier(path.dirname(absolute), spec);

    if (!target) throw new Error(`Could not resolve "${spec}" from ${absolute}`);

    if (target.endsWith("AuthContext.jsx") || target.endsWith("AuthContext.js")) {
      resolved.set(spec, authStubPath);
      continue;
    }

    const aliasKey = Object.keys(SERVICE_ALIASES).find((k) => normalized.endsWith(k));

    if (aliasKey) {
      resolved.set(spec, SERVICE_ALIASES[aliasKey]);
      continue;
    }

    resolved.set(spec, await buildModule(target));
  }

  const rewritten = result.code.replace(importPattern, (match, pre, spec, post) => {
    if (!spec.startsWith(".")) return match;
    const rel = path.relative(outDir, resolved.get(spec)).replace(/\\/g, "/");
    return `${pre}${rel.startsWith(".") ? rel : `./${rel}`}${post}`;
  });

  fs.writeFileSync(outFile, withEnvShim(rewritten));
  return outFile;
};

const { default: App } = await import(
  pathToFileURL(await buildModule("src/App.jsx")).href
);
const { __authValue } = await import(pathToFileURL(authStubPath).href);

/*
 * App.jsx contains its own <BrowserRouter>, so it must be rendered bare - a
 * <MemoryRouter> wrapper would nest two routers and throw.
 *
 * `BrowserRouter` reads `window.location` when it mounts, so each render sets
 * the URL on the shared `window`/`document.defaultView` shim first. This drives
 * the REAL router, which is exactly what we want to exercise.
 */
const setUrl = (url) => {
  const resolved = new URL(url, "http://localhost");

  const next = {
    href: resolved.href,
    origin: resolved.origin,
    protocol: resolved.protocol,
    host: resolved.host,
    hostname: resolved.hostname,
    port: resolved.port,
    pathname: resolved.pathname,
    search: resolved.search,
    hash: resolved.hash,
    assign() {},
    replace() {},
    toString: () => resolved.href,
  };

  // The router reaches the URL through document.defaultView.location as well as
  // window.location, so both must be the same object.
  globalThis.location = next;
  globalThis.window = globalThis;
  globalThis.document.defaultView = globalThis;
  globalThis.document.location = next;
};

const renderAt = (url) => {
  setUrl(url);
  return renderToStaticMarkup(h(App));
};

/* ------------------------------------------------------------------ */
/* Guest                                                              */
/* ------------------------------------------------------------------ */
console.log("=== GUEST (no session) ===");
__authValue.current = {
  user: null,
  isAuthenticated: false,
  loading: false,
  role: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

const renderGuest = (url) => renderAt(url);

for (const [url, label] of [
  ["/", "Home"],
  ["/discussions", "Discussions"],
  ["/categories", "Categories"],
  ["/login", "Login"],
  ["/register", "Register"],
]) {
  const html = renderGuest(url);
  check(`guest ${url} (${label}) renders the public footer`, html.includes("<footer"), true);
  check(`guest ${url} (${label}) renders no app sidebar`, html.includes("<aside"), false);
  check(`guest ${url} (${label}) is not a 404`, html.includes("Page not found"), false);
}

// Detail pages are shared too - a visitor must reach them without a session.
for (const url of [
  "/discussions/64b7f9c2e1a2b3c4d5e6f701",
  "/categories/64b7f9c2e1a2b3c4d5e6f702",
]) {
  const html = renderGuest(url);
  check(`guest ${url} renders the public footer`, html.includes("<footer"), true);
  check(`guest ${url} renders no app sidebar`, html.includes("<aside"), false);
}

/*
 * A guest hitting an auth-only page is caught by <ProtectedRoute>, which renders
 * <Navigate to="/login">. `<Navigate>` performs its redirect in an effect, so
 * during a static render it produces NO output at all - the assertion is that
 * the protected UI was withheld, not that the login form is present inline.
 */
{
  const html = renderGuest("/dashboard");
  check("guest /dashboard renders no app sidebar", html.includes("<aside"), false);
  check("guest /dashboard withholds the dashboard content", html.includes("Welcome back"), false);
  check("guest /dashboard renders nothing (guard redirected)", html.trim() === "", true);
}

{
  const html = renderGuest("/admin");
  check("guest /admin withholds the admin console", html.includes("Admin"), false);
  check("guest /admin renders nothing (guard redirected)", html.trim() === "", true);
}

/* ------------------------------------------------------------------ */
/* Signed in                                                          */
/* ------------------------------------------------------------------ */
console.log("\n=== SIGNED IN (admin) ===");
__authValue.current = {
  user: { _id: "u1", name: "Admin Person", email: "a@example.com", role: "admin" },
  isAuthenticated: true,
  loading: false,
  role: "admin",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

const renderSignedIn = (url) => renderAt(url);

for (const url of ["/dashboard", "/my-discussions", "/profile", "/moderation", "/admin"]) {
  const html = renderSignedIn(url);
  check(`admin ${url} renders the app sidebar`, html.includes("<aside"), true);
  check(`admin ${url} renders no public footer`, html.includes("<footer"), false);
  check(`admin ${url} shows the avatar menu trigger`, html.includes('aria-label="Account menu"'), true);
}

/*
 * THE BEHAVIOUR THIS PASS CHANGED.
 *
 * Shared pages opened by a signed-in user must render INSIDE the application
 * shell - sidebar present, public navbar/footer gone - so clicking Discussions
 * or Categories in the sidebar swaps only the right-hand content, exactly as
 * Profile and My Discussions already did.
 */
for (const url of [
  "/",
  "/discussions",
  "/discussions/64b7f9c2e1a2b3c4d5e6f701",
  "/categories",
  "/categories/64b7f9c2e1a2b3c4d5e6f702",
  "/no-such-page",
]) {
  const html = renderSignedIn(url);
  check(`signed-in ${url} renders the app sidebar`, html.includes("<aside"), true);
  check(`signed-in ${url} renders no public footer`, html.includes("<footer"), false);
  check(`signed-in ${url} shows the avatar menu trigger`, html.includes('aria-label="Account menu"'), true);
}

// The sidebar must actually offer Discussions and Categories as in-app links.
{
  const html = renderSignedIn("/dashboard");
  check("sidebar links to /discussions", html.includes('href="/discussions"'), true);
  check("sidebar links to /categories", html.includes('href="/categories"'), true);
  check("app top bar links home", html.includes('href="/"'), true);
}

/* ------------------------------------------------------------------ */
/* Branding                                                           */
/* ------------------------------------------------------------------ */
console.log("\n=== BRANDING (ChatterBox) ===");

// Guests: the public navbar and footer carry the brand.
__authValue.current = {
  user: null,
  isAuthenticated: false,
  loading: false,
  role: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

for (const url of ["/", "/discussions", "/categories"]) {
  const html = renderAt(url);
  check(`guest ${url} shows the ChatterBox brand`, html.includes("ChatterBox"), true);
  check(`guest ${url} hides the old brand`, html.includes("Community Forum"), false);
}

// Signed in: the application shell carries the brand.
__authValue.current = {
  user: { _id: "u1", name: "Admin Person", email: "a@example.com", role: "admin" },
  isAuthenticated: true,
  loading: false,
  role: "admin",
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

for (const url of ["/dashboard", "/discussions", "/admin"]) {
  const html = renderAt(url);
  check(`signed-in ${url} shows the ChatterBox brand`, html.includes("ChatterBox"), true);
  check(`signed-in ${url} hides the old brand`, html.includes("Community Forum"), false);
}

/* ------------------------------------------------------------------ */
/* Session still loading                                              */
/* ------------------------------------------------------------------ */
console.log("\n=== LOADING (session unknown) ===");
__authValue.current = {
  user: null,
  isAuthenticated: false,
  loading: true,
  role: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
};

// Neither shell may render while the session is unknown, or a refresh would
// flash the public navbar at a signed-in user (and the app sidebar at a guest).
for (const url of ["/", "/discussions", "/categories", "/dashboard"]) {
  const html = renderAt(url);
  check(`loading ${url} renders no public footer`, html.includes("<footer"), false);
  check(`loading ${url} renders no app sidebar`, html.includes("<aside"), false);
}

console.log(`\n${failures === 0 ? "ALL SHELL CHECKS PASSED" : `${failures} SHELL CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
