# ChatterBox — project notes

> **The product is named ChatterBox** (renamed from "Community Forum" on
> 2026-10-06). Use `ChatterBox` for branding; `community forum` is fine as a
> *description* of what it is.
>
> ⚠️ This folder (`.workbuddy-ai/`) is **untracked and has been wiped twice** by
> a teammate's `git clean -fd`. It is *not* gitignored, so `git add
> .workbuddy-ai` would preserve it. Otherwise project memory is lost on every
> branch operation.

## Stack
- `client/` React 19 + Vite 8 + React Router 7 + Axios + Tailwind CSS v4
  (v4 via `@tailwindcss/vite`; **no** tailwind.config.js / postcss.config.js).
- `server/` Express 5 + MongoDB/Mongoose 9 + JWT in an **httpOnly cookie** +
  Zod 4 + `http-errors` + routes→controllers→services→models layering.
- Package names: `chatterbox-client`, `chatterbox-server` (renamed with the
  lockfiles kept in sync — `npm ls` verified clean).

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
   Always read `obj?._id ?? obj?.id`.
6. **One detail component**: `Discussions/DiscussionDetails.jsx` at
   `/discussions/:id`. There is no `DiscussionDetail.jsx` (singular).
7. Categories are referenced by **ObjectId**, not name/slug.
8. **`Reports/ReportDialog.jsx` is the only report form.** Do not add a second.

## Shells & navigation
9. **The shell follows the SESSION, not the route.** Three components:
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
10. **Nav table = `layout/navItems.js`** (one source, filtered by `roles`).
    Sidebar and `AvatarMenu` both read it. `/discussions/new` is a **static**
    segment so it outranks `/discussions/:id` — creating stays auth-only.
11. **Never print the full name in the navbar/avatar.** Use `getInitials()` from
    `utils/name.js` (JD / J / MJ / AI) as a circular monogram. The brand
    monogram in the navbar/footer/top bar is **`CB`** (was `CF`).
12. **Redirects**: register → `/dashboard`; login →
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
- **There is no `/api/v1/profile` route** (it 404s). The profile API is
  `GET /users/:id`.

## Verified API facts (live API)
- **Register is always `role: "user"`**; a client-sent `role` is ignored.
- **Lock is one-way.** Second lock → 400. No unlock route. Locking blocks **new
  replies only**; the thread stays readable.
- **Removal is not idempotent**: 2nd DELETE → 400; a removed discussion 404s.
- **Category names are trimmed + lowercased** before save and uniqueness check.
  Duplicate → **409** naming no field. **Deleting does not cascade** — orphaned
  discussions get `category: null`. Writes are **admin-only** (moderator → 403).
- `GET /categories` → `{ data: { categories: [...] } }` — normal envelope,
  **not** a bare array.
- **`GET /users/:id` is public** and selects only
  `"name email avatar bio createdAt"` — **`role` is NOT included**; read the role
  from AuthContext. Nested activity arrays are **not populated**.
- `PATCH /users/:id` is **self-only**. Editable: `name`, `bio`, `avatar` only.
  `avatar` is `string|null`; `bio` is a plain optional string (clear with `""`,
  **`null` → 400**).
- **Reports**: body is XOR — exactly one of `{discussion}` / `{reply}` + `reason`
  (3–1000). Duplicate pending → **409**. Report refs come back **populated**
  (documents, not ids) — read via `getId()`. Moderator `reason` is **always
  optional**; resolve/dismiss **do not cascade**.
- **Admin is admin-only everywhere** — moderator gets 403 even on reads.
  `GET /admin/dashboard` → `data.dashboard` with `users{total,active,inactive,
  moderators}`, `categories{total}`, `discussions{total,active,locked,removed}`,
  `reports{total,pending,resolved,dismissed}`, `moderation{totalActions}`.
  Two self-guards (both 400): changing your own role, deactivating yourself.
  Deactivate = `DELETE /admin/users/:id`; reactivate = `PATCH {isActive:true}`.
  A deactivated account **cannot log in → 403** (login service, not 401).
- **Branding message strings** live in `server/src/constants/index.js`
  (`API_MESSAGES.API_ROOT` / `HEALTH_OK` / `HEALTH_DEGRADED`) → "ChatterBox API…".
  They are documented in `docs/API.md`; keep the two in sync.

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
Tailwind picks the winner (this caused a real white-on-white CTA bug).

## Documentation
- `README.md` — 21 sections (overview → contributing), incl. **§10 Development
  test accounts**, Authentication Flow, Roles, Frontend structure, Routing
  (public vs application shell), Testing checklist, Troubleshooting.
- `docs/API.md` (authoritative endpoints), `docs/PROJECT_STRUCTURE.md`,
  `docs/DEPLOYMENT.md` (**§7b dev test accounts**), `CONTRIBUTING.md`.
- **If you change the API, update `docs/API.md` in the same PR.**

## Gotchas
- **Deleting a category does not cascade.** `Discussion` has no text index —
  search is a regex scan.
- `GET /health` is **liveness only**; use **`GET /api/v1/ready`** for deploy
  gating. `/health` at the root is a 404 — it lives under `/api/v1`.
- Cookie: `accessToken`, httpOnly, `secure`/`SameSite=None` in production,
  `SameSite=Lax` in dev, 24h. Prod **requires HTTPS**.
- Vite emits root-absolute `/assets/...` — serve from the domain root. SPA
  fallback to `index.html` is mandatory.
- **DNS**: this machine's default resolver cannot reach Atlas SRV records
  (`querySrv ECONNREFUSED`), so a plain `npm start` **fails here** with
  `[server] failed to start the ChatterBox API`. Fix with
  `dns.setServers(["8.8.8.8","1.1.1.1"]); dns.setDefaultResultOrder("ipv4first")`
  **before** `mongoose.connect` (the verification scripts bake this in). The
  deployed host is unaffected.
- **Sandbox**: `/tmp` is unusable for file writes (use
  `C:/Users/sojco/AppData/Local/Temp` for cookie jars); recursive deletes are
  routed to OS trash and time out (use `mkdirSync`, plain `rm -f`, never
  `rm -rf`); ports 4173/4174/5173 are intercepted by a proxy returning 502, so
  use the SSR-harness approach instead of `vite preview`.
- **`npm run build` fails if `client/dist` already exists** (recursive delete
  times out). Clear `dist/index.html` + `dist/assets` first with plain `rm`.
- **Node `fetch` is strict about method casing** — lowercase `"patch"` sends a
  wrong request that surfaces as a bogus 400. Always `.toUpperCase()`.
- **Write assertions from the backend contract, not from memory.**
- Verification harnesses (`client/scripts/verify-*.mjs`,
  `server/scripts/verify-*.mjs`) render the **real** `App.jsx` with a shimmed DOM
  and stubbed services — the cheapest way to prove which shell/route/brand
  rendered. `renderToStaticMarkup` does not run effects, so a `<Navigate>` guard
  produces **no output**; assert "protected content absent", not "login page
  present".

## Production readiness
- `/authorization/*` is dev-only (404 in production) — the gate is intentional.
- `JWT_SECRET` must be ≥32 chars in production; `env.js` validates at boot.
- **Committed-secret incident**: commit `f0b6ba6` contains the real `JWT_SECRET`
  and Atlas `MONGODB_URI` (root `.env`). Rotation required.
- **Do NOT add `VITE_*_PASSWORD` variables to `client/.env.example`** — anything
  `VITE_`-prefixed is inlined into the browser bundle. A merge added
  `VITE_USER_PASSWORD` / `VITE_MODERATOR_PASSWORD` / `VITE_ADMIN_PASSWORD` on
  2026-10-04; reverted. Keep the client env to `VITE_API_URL` alone.
- `docs/DEPLOYMENT.md`'s verification table still shows pre-rename numbers
  (133 modules / 452.20 kB); the current build is 142 modules / 470.85 kB.
  Update it when convenient.
