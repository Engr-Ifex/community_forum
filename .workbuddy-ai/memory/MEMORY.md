# Community Forum — project notes

> Rebuilt 2026-10-04 after the folder was wiped by a `git clean` in a teammate's
> workflow (it was untracked). Keep this file dense — it is injected on session
> start and gets truncated if it grows too large.

## Stack
- `client/` React 19 + Vite 8 + React Router 7 + Axios + Tailwind CSS v4
  (v4 via `@tailwindcss/vite`; **no** tailwind.config.js / postcss.config.js).
- `server/` Express 5 + MongoDB/Mongoose 9 + JWT in an **httpOnly cookie** +
  Zod 4 + `http-errors` + routes→controllers→services→models layering.

## Non-negotiable conventions
1. **One Axios instance** — `client/src/services/api.js`. Never a second. Its
   response interceptor resolves with `response.data`, so callers read
   `response.data.<resource>`. Errors normalise into `ApiError`
   (`message`, `status`, `errors`).
2. **Response envelope** is always `{ success, message, data? }` (server) or
   `{ success, message, errors? }` (failure). Do not change its shape.
3. **Auth**: JWT lives in the `accessToken` httpOnly cookie; JS cannot read it.
   Session validity comes only from `GET /auth/me`. **Never use `localStorage`
   as a source of truth.**
   `AuthContext` exposes exactly: `user, isAuthenticated, loading, role, login,
   register, logout, refreshUser`. The flag is **`loading`** (it was once
   `isLoading`; that drift silently broke refresh-persistence).
4. **Route guards**: `ProtectedRoute` with optional `roles={[…]}`.
   `/moderation` = moderator|admin, `/admin` = admin. It must render a loader
   while `loading` is true, or a refresh bounces signed-in users to `/login`.
5. **Identity keys**: Mongoose serialises as **`_id`** (no `id` virtual).
   Always read `obj?._id ?? obj?.id` — comparing `user.id` silently fails.
6. **One detail component**: `Discussions/DiscussionDetails.jsx` at
   `/discussions/:id`. There is no `DiscussionDetail.jsx` (singular).
7. Categories are referenced by **ObjectId**, not name/slug.

## Shells & navigation (Phase 11–12)
8. **The shell follows the SESSION, not the route.** Three components:
   - `layout/PublicShell.jsx` — guest chrome: `Navbar` + page + `Footer`.
     **The public navbar renders only here.**
   - `layout/AppLayout.jsx` — signed-in chrome: top bar + `<aside>` sidebar
     (drawer below `md`). Renders `{children ?? <Outlet/>}`.
   - `layout/SiteShell.jsx` — the switch. `loading` → spinner only; authed →
     `AppLayout`; guest → `PublicShell` (centred `max-w-5xl`, or raw with
     `fullBleed` for `/`).
   `App.jsx` has three groups: **shared** (`/`, `/discussions`,
   `/discussions/:id`, `/categories`, `/categories/:id`, `*`) wrapped in
   `<SiteShell>`; **guest-only** (`/login`, `/register`) in `<PublicShell>`;
   **signed-in-only** under `<ProtectedRoute><AppLayout/></ProtectedRoute>`.
   **Any new shared page MUST be wrapped in `SiteShell`**, or the public navbar
   leaks back in over the app. `client/scripts/verify-shells.mjs` asserts this.
9. **Nav table = `layout/navItems.js`** (one source, filtered by `roles`).
   Sidebar and `AvatarMenu` both read it. `/discussions/new` is a **static**
   segment so it outranks `/discussions/:id` — creating stays auth-only.
10. **Never print the full name in the navbar/avatar.** Use `getInitials()` from
    `utils/name.js` (JD / J / MJ / AI) as a circular monogram.
    `getPreferredName()` feeds "Welcome back, X".
11. **Redirects**: register → `/dashboard`; login →
    `location.state?.from?.pathname ?? "/dashboard"`; logout → `POST
    /auth/logout`, clear AuthContext, `navigate("/", {replace:true})`.

## API surface (prefix `/api/v1`)
- `auth`: POST register|login|logout, GET me
- `users`: GET /:id (public → `{ user, discussions, replies }`), PATCH /:id (self)
- `categories`: GET / , GET /:id (public); POST/PATCH/DELETE (admin only)
- `discussions`: GET / (public; `search`,`category`,`page`,`limit`,
  `sort`=latest|oldest|popular), GET /:id (increments views); POST/PATCH/DELETE
- replies: GET|POST `/discussions/:id/replies`, PATCH|DELETE `/replies/:id`
- `reports`: POST / (auth), GET / , GET /:id (moderator|admin)
- `moderation`: PATCH `/reports/:id/{dismiss,resolve}`,
  PATCH `/discussions/:id/lock`, DELETE `/discussions/:id`, DELETE `/replies/:id`
- `admin`: GET dashboard|users|users/:id|discussions|reports|moderation-actions,
  PATCH users/:id, DELETE users/:id
- `authorization`: role probes — **dev only** (gated behind `!env.isProduction`)

## Verified API facts (live API)
- **Register is always `role: "user"`**; a client-sent `role` is ignored
  (escalation attempt verified harmless). Register → 201 + cookie.
- **Lock is one-way.** Second lock → 400 "already locked". No unlock route
  exists. Locking blocks **new replies only**; the thread stays readable.
- **Removal is not idempotent**: 2nd DELETE → 400 "already removed";
  a removed discussion then 404s on `GET /discussions/:id`.
- **Category names are trimmed + lowercased** before save and uniqueness check
  (`"  General  "` collides with `"general"`). Duplicate → **409** naming no
  field. Renaming to its own name is allowed. Empty PATCH body → 400.
  **Deleting a category does NOT cascade** — discussions are orphaned
  (`category` becomes null). Writes are **admin-only** (moderator → 403).
- `GET /categories` → `{ data: { categories: [...] } }` — the normal envelope,
  **not** a bare array.
- **`GET /users/:id` is public** and selects only
  `"name email avatar bio createdAt"` — **`role` is NOT included**; read the
  role from AuthContext. Nested activity arrays are **not populated**
  (`category` is a raw id string; replies carry only a `discussion` id, no title).
- `PATCH /users/:id` is **self-only** (other → 403). Editable: `name`, `bio`,
  `avatar` only. `avatar` is `string|null`; `bio` is a plain optional string
  (clear with `""`, **`null` → 400**).
- **Reports**: body is XOR — exactly one of `{discussion}` / `{reply}` + `reason`
  (3–1000). Duplicate `{reportedBy, target, status:"pending"}` → **409** (so it
  becomes possible again once resolved). Report refs come back **populated**
  (documents, not ids) — read them via `getId()`. The moderator `reason` is
  **always optional**; resolve/dismiss **do not cascade** onto content.
- **Admin is admin-only everywhere** — moderator gets 403 even on reads.
  `GET /admin/dashboard` → `data.dashboard` with `users{total,active,inactive,
  moderators}`, `categories{total}`, `discussions{total,active,locked,removed}`,
  `reports{total,pending,resolved,dismissed}`, `moderation{totalActions}`.
  `users.moderators` excludes admins; `discussions.removed` is derived.
  Two self-guards (both 400): changing your own role, deactivating yourself.
  Deactivate = `DELETE /admin/users/:id`; reactivate = `PATCH {isActive:true}`.
  A deactivated account **cannot log in → 403** (from the login service, not 401).

## Local setup
1. `cp server/.env.example server/.env` — real `MONGODB_URI` + 32+ char
   `JWT_SECRET`. `cp client/.env.example client/.env`.
2. `npm install` in both, then `npm run dev` in `server/` and `client/`.
3. **Dev seed: `npm run seed`** (in `server/`) → `server/scripts/seed.js`.
   Creates/repairs `admin@example.com` / `Admin123!` and
   `moderator@example.com` / `Moderator123!`. Idempotent (2nd run → `EXISTS`),
   refuses `NODE_ENV=production` (exit 1), bcrypt cost 12, never prints
   passwords, bakes in the SRV DNS fallback. **DEVELOPMENT/TESTING ONLY.**
   `.gitignore`: `server/scripts/*` with `!server/scripts/seed.js`.
4. Manual admin instead: register, then set `role:"admin"` in MongoDB.

## Design system
`components/common/ui.jsx` is the single source. `buttonClass(variant,size,extra)`
— `primary` (blue-600) / `secondary` (slate outline) / `ghost` / `danger` (red).
`inverseButtonClass` for the ONE dark surface (`Home/FinalCta.jsx`). Form:
`inputClass/selectClass/textareaClass/labelClass/hintClass/fieldErrorClass`.
Surfaces: `cardClass/cardLinkClass/pageTitleClass/...`. States: `Skeleton`,
`CardSkeletonList`, `Notice`, `EmptyState`, `ErrorState`, `PageHeader`.
Palette: slate neutrals + one `blue-600` accent; active pills
`bg-blue-600 text-white`.
**NEVER override a variant's colour via `extra`** — Tailwind v4 emits utilities
in a fixed internal property order, not class-string order, so
`buttonClass("primary","lg","bg-white text-slate-900")` emits both rules and
Tailwind picks the winner (this caused a real white-on-white CTA bug). Compose a
fresh class string instead.

## Documentation
- `README.md` — 21 sections (overview → contributing), incl. **§10 Development
  test accounts**, an Authentication Flow, Roles, Frontend structure, Routing
  (public vs application shell), Testing checklist, Troubleshooting.
- `docs/API.md` (authoritative endpoints), `docs/PROJECT_STRUCTURE.md`,
  `docs/DEPLOYMENT.md` (**§7b dev test accounts**), `CONTRIBUTING.md`.
- **If you change the API, update `docs/API.md` in the same PR.**

## Gotchas
- **Deleting a category does not cascade.** `Discussion` has no text index —
  search is a regex scan.
- `GET /health` is **liveness only** (200 even if Mongo is down); use
  **`GET /api/v1/ready`** for deploy gating (503 `HEALTH_DEGRADED`).
  `/health` at the root is a 404 — it lives under `/api/v1`.
- Cookie: `accessToken`, httpOnly, `secure`/`SameSite=None` in production,
  `SameSite=Lax` in dev, 24h. Prod **requires HTTPS**.
- Vite emits root-absolute `/assets/...` — serve from the domain root. SPA
  fallback to `index.html` is mandatory.
- **DNS**: this machine's default resolver cannot reach Atlas SRV records
  (`querySrv ECONNREFUSED`). Fix with
  `dns.setServers(["8.8.8.8","1.1.1.1"]); dns.setDefaultResultOrder("ipv4first")`
  **before** `mongoose.connect`.
- **Sandbox**: `/tmp` → `C:\tmp`; recursive deletes are routed to OS trash and
  time out (use `mkdirSync`, plain `rm -f`, never `rm -rf`); ports
  4173/4174/5173 are intercepted by a proxy returning 502, so use the
  SSR-harness approach instead of `vite preview`.
- **`npm run build` fails if `client/dist` already exists** (recursive delete
  times out). Clear `dist/index.html` + `dist/assets` first with plain `rm`.
- **Node `fetch` is strict about method casing** — lowercase `"patch"` sends a
  wrong request that surfaces as a bogus 400. Always `.toUpperCase()`.
- **Write assertions from the backend contract, not from memory.**
- Verification harnesses (`client/scripts/verify-*.mjs`,
  `server/scripts/verify-*.mjs`) render the **real** `App.jsx` with a shimmed DOM
  and stubbed services — the cheapest way to prove which shell/route rendered.
  `renderToStaticMarkup` does not run effects, so a `<Navigate>` guard produces
  **no output**; assert "protected content absent", not "login page present".

## Production readiness
- `/authorization/*` is dev-only (404 in production) — the gate is intentional.
- `JWT_SECRET` must be ≥32 chars in production; `env.js` validates at boot.
- **Committed-secret incident**: commit `f0b6ba6` contains the real `JWT_SECRET`
  and Atlas `MONGODB_URI` (root `.env`). Rotation required.
- **Do NOT add `VITE_*_PASSWORD` variables to `client/.env.example`** — anything
  `VITE_`-prefixed is inlined into the browser bundle. A merge added
  `VITE_USER_PASSWORD` / `VITE_MODERATOR_PASSWORD` / `VITE_ADMIN_PASSWORD` on
  2026-10-04; reverted. Keep the client env to `VITE_API_URL` alone.
