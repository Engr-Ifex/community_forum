# Community Forum

A full-stack discussion forum where people ask questions, share what they know,
and follow the conversations worth following. It ships with authentication,
role-based access (user / moderator / admin), threaded replies, reporting, a
moderation queue, and an admin console.

The project is split into two independent applications:

| Folder    | App                    | Stack                                                     |
| --------- | ---------------------- | --------------------------------------------------------- |
| `client/` | React single-page app  | React 19, Vite 8, React Router 7, Axios, Tailwind CSS v4  |
| `server/` | REST API               | Express 5, MongoDB + Mongoose 9, JWT (httpOnly cookie), Zod 4 |

---

## Table of contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Tech stack](#3-tech-stack)
4. [Architecture](#4-architecture)
5. [Project structure](#5-project-structure)
6. [Prerequisites](#6-prerequisites)
7. [Installation](#7-installation)
8. [Environment variables](#8-environment-variables)
9. [Running locally](#9-running-locally)
10. [Development test accounts](#10-development-test-accounts)
11. [Available scripts](#11-available-scripts)
12. [API overview](#12-api-overview)
13. [Authentication & roles](#13-authentication--roles)
14. [Database models](#14-database-models)
15. [Frontend design system](#15-frontend-design-system)
16. [Routing](#16-routing)
17. [Error handling](#17-error-handling)
18. [Testing & verification](#18-testing--verification)
19. [Building for production](#19-building-for-production)
20. [Troubleshooting](#20-troubleshooting)
21. [Contributing](#21-contributing)

---

## 1. Overview

Community Forum is a capstone-style full-stack project. It is a classic
forum: public browsing, authenticated posting, moderator tooling and an admin
console. The frontend is a single-page React app that talks to a versioned REST
API over `fetch`/Axios with a cookie-based session.

Key design decisions:

- **Session in an httpOnly cookie.** The JWT is never exposed to JavaScript, so
  an XSS bug cannot exfiltrate it. The client discovers its session exclusively
  by asking `GET /auth/me`.
- **One Axios instance.** Every network call in the client goes through a single
  configured instance (`client/src/services/api.js`) so base URL, credentials
  and error normalisation live in exactly one place.
- **Layered backend.** Requests flow `routes → controllers → services → models`.
  Controllers stay thin; business logic lives in services; validation is applied
  at the route boundary with Zod.
- **One design system.** Buttons, form controls, cards and states are defined
  once in `client/src/components/common/ui.jsx` and reused everywhere, so the
  whole app shares the Home page's visual language.
- **Two navigation shells, one app.** Signed-out visitors get the public navbar
  (Logo, Home, Discussions, Categories, Login, Register); signed-in users get an
  application shell with a sidebar and an avatar menu. The switch is driven by
  the real role from `AuthContext`, while the server keeps enforcing every rule.
- **Role-aware, not role-trusting.** The client hides links a user cannot use and
  shows a loader while the session is being restored — but authorisation is
  always re-checked by the API, so a tampered client gains nothing.

## 2. Features

**Public**

- Browse the discussion list with search, category filter, sort and pagination.
- Read any discussion and its replies.
- Browse categories and per-category discussion lists.
- View any user's public profile and their discussions/replies.

**Authenticated (any signed-in user)**

- Log in to a dedicated **application shell** — a sidebar layout that shares the
  Home page's visual language — and land on `/dashboard` immediately.
- Dashboard: a welcome banner (`Welcome back, <first name>`), your own activity
  (discussions started, replies posted, latest thread), recent discussions,
  categories and quick actions — all from live API data.
- Avatar menu: initials monogram (or avatar image), full name, email, role,
  Profile and Logout — reachable on desktop and mobile.
- Register / log in / log out.
- Create, edit and delete your own discussions.
- Post, edit and delete your own replies.
- Report a discussion or a reply.
- Edit your own profile (name, bio, avatar).

**Moderator** (everything above, plus)

- View the report queue and individual reports.
- Dismiss or resolve reports.
- Lock or remove discussions.
- Remove replies.

**Admin** (everything above, plus)

- Admin console with platform statistics.
- Manage users: change role, deactivate/reactivate accounts.
- Manage categories: create, edit, delete.
- Review all discussions, reports and the moderation action history.

## 3. Tech stack

**Frontend** (`client/`)

- React 19 + Vite 8
- React Router 7 (client-side routing, including route guards)
- Axios (single shared instance)
- Tailwind CSS v4 via `@tailwindcss/vite` — *no* `tailwind.config.js` and *no*
  `postcss.config.js`; v4 is configured in CSS
- `oxlint` for linting

**Backend** (`server/`)

- Node.js (>= 18.18)
- Express 5
- MongoDB with Mongoose 9
- JSON Web Tokens (`jsonwebtoken`) stored in an httpOnly cookie
- `bcryptjs` for password hashing
- Zod 4 for request validation
- `helmet`, `cors`, `cookie-parser`, `morgan`, `express-rate-limit`

## 4. Architecture

```
Browser (React SPA, client/)
        │  Axios  →  VITE_API_URL (http://localhost:5000/api/v1)
        │           credentials: include  →  accessToken cookie
        ▼
Express API (server/)
   routes/         URL → middleware → controller   (Zod validation here)
   controllers/    parse the request, call a service, shape the envelope
   services/       business rules + Mongoose queries
   models/         Mongoose schemas and indexes
   middleware/     auth (JWT), role gates, validation, rate limit, errors
        ▼
MongoDB
```

Every response uses one envelope:

```jsonc
// success
{ "success": true, "message": "…", "data": { /* resource keys */ } }

// failure
{ "success": false, "message": "…", "errors": [ /* optional field errors */ ] }
```

The client's Axios interceptor unwraps the success envelope, so callers read
`response.data.<resource>` (for example `response.data.discussions`).

See [docs/API.md](docs/API.md) for the full endpoint reference and
[docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for a file-by-file map.

## 5. Project structure

```
community_forum/
├─ client/                     # React + Vite frontend
│  ├─ src/
│  │  ├─ components/           # feature folders + shared components
│  │  │  ├─ Admin/             # admin console + its sub-panels
│  │  │  ├─ Categories/        # category list, category page, dialogs
│  │  │  ├─ Dashboard/         # authenticated dashboard + my discussions
│  │  │  ├─ Discussions/       # list, detail, create/edit, replies
│  │  │  ├─ Home/              # landing page sections
│  │  │  ├─ Login/ Register/   # auth pages
│  │  │  ├─ Moderation/        # moderation queue
│  │  │  ├─ Profile/           # profile view + edit + Avatar
│  │  │  ├─ Reports/           # report dialog
│  │  │  ├─ layout/            # AppLayout, Sidebar, AvatarMenu, navItems
│  │  │  └─ common/            # ui.jsx (design system), Navbar, Footer, …
│  │  ├─ context/              # AuthContext (session source of truth)
│  │  ├─ routes/               # ProtectedRoute (role-aware guard)
│  │  ├─ services/             # one module per API resource + api.js
│  │  └─ utils/                # name.js (initials), identity helpers
│  ├─ .env.example
│  └─ package.json
├─ server/                     # Express REST API
│  ├─ src/
│  │  ├─ config/               # env loader (validated) + database connection
│  │  ├─ constants/            # HTTP statuses, shared messages
│  │  ├─ controllers/          # request/response shaping
│  │  ├─ middleware/           # auth, roles, validation, rate limit, errors
│  │  ├─ models/               # Mongoose schemas
│  │  ├─ routes/               # URL wiring + validation per route
│  │  ├─ services/             # business logic
│  │  ├─ utils/                # response helpers, asyncHandler, token
│  │  ├─ validators/           # Zod schemas
│  │  ├─ app.js                # Express wiring
│  │  └─ server.js             # process entry point
│  ├─ scripts/                 # seed.js (dev-only test accounts)
│  ├─ .env.example
│  └─ package.json
├─ docs/
│  ├─ API.md                   # endpoint reference
│  ├─ DEPLOYMENT.md            # production deployment notes
│  └─ PROJECT_STRUCTURE.md     # deeper structure notes
├─ CONTRIBUTING.md
└─ README.md
```

### Frontend structure in detail

The client is organised so that *what a user can see* is decided in one place.

```
client/src/
├─ App.jsx                     # the real route table; each route names its shell
├─ context/AuthContext.jsx     # session source of truth (GET /auth/me)
├─ routes/ProtectedRoute.jsx   # auth + optional role gate
├─ components/
│  ├─ layout/
│  │  ├─ SiteShell.jsx         # picks the shell from the session (shared pages)
│  │  ├─ PublicShell.jsx       # guest shell: Navbar + page + Footer
│  │  ├─ AppLayout.jsx         # authenticated shell: top bar + sidebar
│  │  ├─ Sidebar.jsx           # desktop aside + mobile drawer contents
│  │  ├─ AvatarMenu.jsx        # initials avatar + dropdown (Profile / Logout)
│  │  └─ navItems.js           # the nav table, filtered by role
│  ├─ Dashboard/Dashboard.jsx  # /dashboard
│  ├─ Dashboard/MyDiscussions.jsx  # /my-discussions
│  ├─ common/Navbar.jsx        # the public navbar (rendered by PublicShell)
│  ├─ common/Footer.jsx        # the public footer (rendered by PublicShell)
│  └─ common/ui.jsx            # design system: buttons, fields, cards, states
└─ utils/name.js               # getInitials() + getPreferredName()
```

**One session state, one shell.** `SiteShell` is the switch: a guest gets
`PublicShell` (marketing navbar + footer), a signed-in user gets `AppLayout`
(top bar + sidebar). Because the *shell* depends on the session rather than the
route, the pages both audiences may read — `/`, `/discussions`, `/categories`,
their detail pages and the 404 — keep the sidebar in place when a signed-in user
opens them from it, and keep the marketing navbar for visitors.

`common/Navbar.jsx` therefore belongs to guests only: a signed-in user never sees
it, anywhere. `navItems.js` is the single table both the sidebar and the avatar
menu read from.

## 6. Prerequisites

- **Node.js >= 18.18** (the backend declares this in `engines`). Node 20+ is
  recommended.
- **npm** (bundled with Node).
- **MongoDB** — either a local server (`mongodb://127.0.0.1:27017`) or a
  MongoDB Atlas cluster connection string.

## 7. Installation

Clone the repository, then install each app's dependencies:

```bash
git clone <repository-url>
cd community_forum

# backend
cd server
npm install

# frontend
cd ../client
npm install
```

Then create the environment files (see the next section):

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

## 8. Environment variables

Both apps read a local `.env` file that is **git-ignored**. Templates are
committed as `.env.example`. Never commit real secrets.

### `server/.env`

| Variable                | Required | Default                 | Notes                                                                 |
| ----------------------- | -------- | ----------------------- | --------------------------------------------------------------------- |
| `NODE_ENV`              | no       | `development`           | One of `development`, `test`, `production`.                           |
| `PORT`                  | no       | `5000`                  | Integer 1–65535.                                                      |
| `MONGODB_URI`           | **yes**\* | —                       | Local or Atlas connection string.                                    |
| `JWT_SECRET`            | **yes**\* | —                       | Long random string. **Must be >= 32 chars in production.**            |
| `JWT_EXPIRES_IN`        | no       | `1d`                    | Token lifetime (e.g. `1d`, `12h`).                                    |
| `CLIENT_URL`            | no       | `http://localhost:5173` | Comma-separated allowed CORS origins.                                 |
| `RATE_LIMIT_WINDOW_MS`  | no       | `900000`                | Rate-limit window in ms.                                              |
| `RATE_LIMIT_MAX`        | no       | `2000` dev / `300` prod | Requests allowed per window.                                          |

\* Required except when `NODE_ENV=test`. The server **validates all of these at
boot** and refuses to start with a clear message if any is missing or invalid.

Generate a safe secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `client/.env`

| Variable       | Required | Example                          | Notes                                     |
| -------------- | -------- | -------------------------------- | ----------------------------------------- |
| `VITE_API_URL` | **yes**  | `http://localhost:5000/api/v1`   | Must include the `/api/v1` prefix.        |

Only variables prefixed with `VITE_` are exposed to the browser. Do not put
secrets here — anything in this file ships to the client.

## 9. Running locally

You need **MongoDB running** before starting the API. Then run the two apps in
two terminals:

```bash
# terminal 1 — API  →  http://localhost:5000/api/v1
cd server
npm run dev

# terminal 2 — web app  →  http://localhost:5173
cd client
npm run dev
```

Open <http://localhost:5173>. The API root responds at
<http://localhost:5000/api/v1> and the health check at
<http://localhost:5000/api/v1/health>.

### Signing in for the first time

Public registration always creates a **`user`** account — there is no way to
self-register as a moderator or an admin, by design. To exercise the moderator
and admin views, use the development seed script in
[section 10](#10-development-test-accounts).

## 10. Development test accounts

> ⚠️ **DEVELOPMENT / TESTING ONLY.** These accounts and their passwords exist
> purely so the role-based UI can be exercised locally. They must **never** be
> created or used on a deployed/production environment. The seed script refuses
> to run when `NODE_ENV=production`, and the credentials below are never
> referenced anywhere in the frontend bundle.

The repository ships one seed script, `server/scripts/seed.js`, which provisions
a ready-made admin and moderator so you can test role-gated navigation without
hand-editing the database.

| Role        | Email                    | Password         |
| ----------- | ------------------------ | ---------------- |
| `admin`     | `admin@example.com`      | `Admin123!`      |
| `moderator` | `moderator@example.com`  | `Moderator123!`  |

A normal `user` account is not seeded — register one at `/register` (this also
lets you confirm that public registration cannot escalate its own role).

**Run it** (with MongoDB reachable, from the repository root):

```bash
cd server
npm run seed
```

The script:

- Reads the **existing** `MONGODB_URI` from `server/.env` — it does not define
  its own connection.
- **Refuses to run in production** (`NODE_ENV=production` → exits non-zero
  before touching the database).
- Is **idempotent**: if an account already exists it is *repaired* (role
  corrected, reactivated, password re-hashed) instead of duplicated, and the run
  reports `EXISTS` for it.
- Hashes passwords with the **same** `bcrypt` cost the app uses, so the seeded
  accounts log in through the normal `/auth/login` endpoint.
- Creates users through the real `User` model (same validation, same defaults).
- **Never prints a password**, and never prints a password hash.

Expected output on a first run (the database name is whatever your `MONGODB_URI`
points at):

```
Connected to "community_forum".

Development role-testing accounts
---------------------------------
CREATED  admin      admin@example.com          new account
CREATED  moderator  moderator@example.com      new account

Passwords are NOT printed. See docs/DEPLOYMENT.md → "Development test accounts".
DEVELOPMENT / TESTING ONLY - never use these in production.
```

On a second run the same rows read `EXISTS` with *"unchanged (password left
as-is)"* — the accounts are repaired in place, never duplicated.

```bash
# In production the script must refuse — this exits 1 without connecting:
NODE_ENV=production npm run seed
# → Refusing to run: NODE_ENV=production.
```

### Creating a real admin without the seed

If you only need a one-off admin (for example in a deployed staging database),
register a normal account through `/register` and flip the role directly in
MongoDB. This is deliberately manual — there is no "make me an admin" endpoint.

```js
// mongosh
use community_forum
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

Then log out and back in — the role is read from the database on
`GET /auth/me`. Moderators are created the same way with
`{ role: "moderator" }`, or from the admin console by an existing admin.

## 11. Available scripts

**Backend** (`cd server`)

| Script        | Command                     | Description                          |
| ------------- | --------------------------- | ------------------------------------ |
| `npm run dev` | `nodemon src/server.js`     | Start with auto-reload.              |
| `npm start`   | `node src/server.js`        | Start without reload.                |
| `npm test`    | `node --test tests/**/*.test.js` | Run the Node test runner.       |
| `npm run seed`| `node scripts/seed.js`      | **Dev only.** Create/repair the admin & moderator test accounts (see section 10). Refuses to run in production. |

**Frontend** (`cd client`)

| Script           | Command         | Description                       |
| ---------------- | --------------- | --------------------------------- |
| `npm run dev`    | `vite`          | Start the dev server with HMR.    |
| `npm run build`  | `vite build`    | Produce a production build in `dist/`. |
| `npm run preview`| `vite preview`  | Serve the built output locally.   |
| `npm run lint`   | `oxlint`        | Lint the source.                  |

## 12. API overview

Base URL: `/api/v1`. Full details, request bodies and response shapes are in
**[docs/API.md](docs/API.md)**.

| Area          | Endpoints                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------- |
| Health / root | `GET /`, `GET /health`                                                                             |
| Auth          | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`                     |
| Authorization | `GET /authorization/user`, `/moderator`, `/admin` (role probes)                                    |
| Users         | `GET /users/:id` (public), `PATCH /users/:id` (self)                                               |
| Categories    | `GET /categories`, `GET /categories/:id` (public); `POST`/`PATCH`/`DELETE` (admin)                 |
| Discussions   | `GET /discussions` (filter/sort/page), `GET /discussions/:id`; `POST`/`PATCH`/`DELETE` (auth)       |
| Replies       | `GET`/`POST /discussions/:id/replies`; `PATCH`/`DELETE /replies/:id`                               |
| Reports       | `POST /reports` (auth); `GET /reports`, `GET /reports/:id` (moderator/admin)                        |
| Moderation    | `PATCH /moderation/reports/:id/{dismiss,resolve}`, `PATCH /moderation/discussions/:id/lock`, `DELETE /moderation/discussions/:id`, `DELETE /moderation/replies/:id` |
| Admin         | `GET /admin/{dashboard,users,users/:id,discussions,reports,moderation-actions}`; `PATCH`/`DELETE /admin/users/:id` |

## 13. Authentication & roles

### Authentication flow

```
Visitor (public site)
   │  Home · Discussions · Categories · Login · Register
   ▼
Register or Log in  ──►  POST /auth/register | POST /auth/login
   │                     (server hashes/verifies, sets the accessToken cookie)
   ▼
Authenticated dashboard  ──►  /dashboard   (application shell: sidebar + avatar)
   │                          role decides which extra links appear
   ▼
Log out  ──►  POST /auth/logout  (server clears the cookie)
   │           client clears AuthContext, redirects to the public "/"
   ▼
Visitor (back to the public site)
```

Because the session lives only in an httpOnly cookie, **every refresh re-runs
the flow from the middle**: the app starts with no known user, calls
`GET /auth/me`, and only then decides which shell to render.

**Register** — `POST /auth/register` creates an account, always with
`role: "user"` (a `role` sent by the client is ignored). On success the user is
signed in and redirected to `/dashboard`. A duplicate email, invalid input,
server error or network failure is each surfaced as a friendly inline message —
never a raw payload.

**Login** — `POST /auth/login` verifies credentials and sets the cookie. A
signed-in user is redirected to `/dashboard`, *or* back to the page they were
originally trying to reach if `ProtectedRoute` sent them to the login page.

**Logout** — calls the existing `POST /auth/logout`, clears `AuthContext` and
any in-memory user state, and redirects to the public `/`. The JWT is **never**
written to `localStorage`; there is no client-side token store to clear.

### Mechanism

On register/login the API issues a JWT and sets it as an httpOnly cookie named
`accessToken` (`secure` + `SameSite=None` in production, `SameSite=Lax` in
development; 24-hour lifetime). JavaScript cannot read the cookie. The client is
authenticated purely by the cookie, sent automatically by Axios because the
instance sets `withCredentials: true`.

**Session discovery.** The frontend's source of truth is `GET /auth/me`. On
startup `AuthContext` calls it once; while the request is in flight the app
exposes `loading: true`, and route guards render a loader rather than bouncing
the user to `/login`. This is why protected pages survive a refresh — and it is
also why the correct navigation never flashes: nothing role-specific renders
until the session is known.

**Roles.** Three roles:

| Role        | Granted                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| `user`      | Create/edit/delete own content, reply, report, edit own profile.          |
| `moderator` | User rights **+** report queue, dismiss/resolve reports, lock/remove content. |
| `admin`     | Moderator rights **+** admin console, user & category management.        |

Role gates are enforced **twice**: on the server
(`requireModerator` / `requireAdmin` middleware) and in the client
(`ProtectedRoute roles={[…]}`, the role-filtered sidebar, and the avatar menu).
The server is the authority; the client gates are purely for UX so users never
see a page they would be bounced from. A client cannot promote itself — a
register request carrying `role: "admin"` still produces a `user`.

**Frontend `AuthContext` keys** — the object returned by `useAuth()` exposes
exactly: `user`, `isAuthenticated`, `loading`, `role`, `login`, `register`,
`logout`, `refreshUser`. The loading flag is named `loading`.

**Initials, not full names.** The navbar and avatar menu never print the full
name — they render a circular monogram built by `getInitials()` in
`client/src/utils/name.js` (`"John Doe"` → `JD`, `"John"` → `J`,
`"Adesoji Ifeoluwapo"` → `AI`; non-alphanumerics are stripped). If the user has
an `avatar` URL it is shown instead, with a graceful fallback to the monogram if
the image fails to load.

## 14. Database models

All models use Mongoose timestamps (`createdAt`, `updatedAt`) and serialise as
`_id` (the `id` virtual is not enabled). **Always read `obj?._id ?? obj?.id`.**

**User** — `name` (2–100), `email` (unique, lowercased), `password`
(bcrypt-hashed, `select: false` so it never leaves the API), `role`
(`user`|`moderator`|`admin`, default `user`), `avatar` (nullable URL), `bio`
(≤ 500), `isActive` (default `true`).

**Category** — `name` (unique, lowercased, 2–100), `description` (≤ 500),
`createdBy` (User ref).

**Discussion** — `title` (3–200), `content` (10–10000), `author` (User ref),
`category` (Category ref), `status` (`active`|`locked`|`removed`), `views`.
Indexed on `createdAt` and `{ category, createdAt }`.

**Reply** — `content` (1–5000), `author` (User ref), `discussion`
(Discussion ref), `status` (`active`|`removed`). Indexed on
`{ discussion, createdAt }`.

**Report** — `reportedBy` (User ref), `discussion` (Discussion ref, nullable),
`reply` (Reply ref, nullable), `reason` (3–1000), `status`
(`pending`|`reviewed`|`resolved`|`dismissed`), `reviewedBy` (User ref, nullable).
Exactly one of `discussion`/`reply` is present.

**ModerationAction** — an audit record: `moderator` (User ref), `action`
(`remove_discussion`|`remove_reply`|`lock_discussion`|`dismiss_report`|
`resolve_report`), `target` (ObjectId), `reason` (≤ 1000).

> **Note on category deletion:** deleting a category does **not** cascade, and
> discussions referencing it are not reassigned. Delete or move affected
> discussions first.

## 15. Frontend design system

Everything visual is defined once in `client/src/components/common/ui.jsx` and
reused across pages, so the app has one visual language rather than a different
palette per page.

**Buttons** — `buttonClass(variant, size, extra)`:

| Variant     | Use                                                              |
| ----------- | ---------------------------------------------------------------- |
| `primary`   | The single loud action (blue-600). Create/save/submit/post.       |
| `secondary` | Neutral outline for the quieter of a pair.                        |
| `ghost`     | Text-only tertiary action (e.g. logout in the navbar).            |
| `danger`    | Destructive actions (delete/remove/deactivate), red and outline.  |

Sizes: `sm`, `md`, `lg`. On the one dark surface (`FinalCta`) use
`inverseButtonClass("solid"|"outline", size)` instead — see the note below.

**Form controls** — `inputClass(hasError, extra)`, `selectClass`, `textareaClass`,
`labelClass`, `hintClass`, `fieldErrorClass`.

**Surfaces & layout** — `cardClass`, `cardLinkClass`, `pageTitleClass`,
`pageSubtitleClass`, `sectionTitleClass`.

**State components** — `Skeleton`, `CardSkeleton`, `CardSkeletonList`, `Notice`
(success/info banner, optional dismiss), `EmptyState`, `ErrorState` (with retry),
`PageHeader`.

**Authenticated shell** — the application layout reuses the same tokens rather
than introducing new ones:

| Piece               | Where                        | Uses                                                                 |
| ------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Top bar             | `layout/AppLayout.jsx`       | `sticky`, `bg-white`, `border-slate-200`, `max-w-7xl`                |
| Sidebar links       | `layout/Sidebar.jsx`         | `sidebarLinkClass` — active = `bg-blue-50 text-blue-700`, idle = `text-slate-600 hover:bg-slate-50` |
| Avatar monogram     | `Profile/Avatar.jsx`         | `rounded-full` + `bg-blue-600 text-white` initials (`sm`/`md` sizes) |
| Dropdown            | `layout/AvatarMenu.jsx`      | `bg-white`, `rounded-xl`, `shadow-lg`, `border-slate-200`            |
| Mobile drawer       | `layout/AppLayout.jsx`       | slide-over + `bg-slate-900/40` scrim, closes on Escape               |

The sidebar is a sticky `<aside>` on `md` and up, and a slide-over drawer below
that breakpoint, so it never permanently covers the page on a small screen.

**Palette** — accent `blue-600` (hover `blue-700`); success `emerald`; danger
`red`; text ramp `slate-900` → `slate-600` → `slate-500` → `slate-400`; borders
`slate-200`; page background `slate-50`; cards `bg-white shadow-sm`; radius
`rounded-lg`/`rounded-xl`; focus ring
`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`.

> **Tailwind v4 warning.** Utilities are emitted in a fixed internal property
> order, *not* the order they appear in a class string. So combining
> `buttonClass("primary", …)` with a `bg-*` or `text-*` override produces **both**
> rules and the winner is decided by Tailwind — which is exactly how a
> white-on-white button happens. Never override a variant's colour through
> `extra`; compose a separate class string instead (as `inverseButtonClass`
> does for the dark CTA panel).

## 16. Routing

Every route is declared once in `client/src/App.jsx`, and **each route names the
shell it belongs to**. There are two shells:

- **`PublicShell`** — `common/Navbar.jsx` + the page + `common/Footer.jsx`. The
  visitor experience. The marketing navbar renders **only** here.
- **`AppLayout`** — sticky top bar (brand + avatar menu), sidebar (a slide-over
  drawer below `md`), page in `<main>`. The signed-in experience.

Routes fall into three groups.

**1. Shared — the shell follows the session** (`SiteShell`). These pages are
readable by anyone, so they must not hard-code a shell: a visitor gets the public
navbar, a signed-in user gets the sidebar. That is what makes a sidebar click on
Discussions or Categories swap only the right-hand content instead of dropping
the user back onto the public navbar.

| Path                        | Page                | Guest           | Signed in        |
| --------------------------- | ------------------- | --------------- | ---------------- |
| `/`                         | Home                | Public shell    | Application shell |
| `/discussions`              | Discussions list    | Public shell    | Application shell |
| `/discussions/:id`          | Discussion detail   | Public shell    | Application shell |
| `/categories`               | Categories list     | Public shell    | Application shell |
| `/categories/:id`           | Category page       | Public shell    | Application shell |
| `*` (unmatched)             | Not found           | Public shell    | Application shell |

**2. Guest only** — `PublicShell`.

| Path                  | Page       | Note                                              |
| --------------------- | ---------- | ------------------------------------------------- |
| `/login`              | Login      | Redirects to `/dashboard` if already signed in     |
| `/register`           | Register   | Redirects to `/dashboard` if already signed in     |

**3. Signed in only** — `ProtectedRoute` + `AppLayout`.

| Path                        | Page                | Access                       |
| --------------------------- | ------------------- | ---------------------------- |
| `/dashboard`                | Dashboard           | Any signed-in user           |
| `/my-discussions`           | My discussions      | Any signed-in user           |
| `/create-discussion`        | Create discussion   | Any signed-in user           |
| `/discussions/new`          | Alias of the above  | Any signed-in user           |
| `/profile`                  | Profile             | Any signed-in user           |
| `/moderation`               | Moderation queue    | `moderator` or `admin`       |
| `/admin`                    | Admin console       | `admin`                      |

> `/discussions/new` is a static segment and outranks `/discussions/:id` in React
> Router's ranking, so creating a discussion still requires a session even though
> the detail page beside it is public.

Guards live in `client/src/routes/ProtectedRoute.jsx`. While the session is
being restored it renders a loader; if the role does not match it redirects — a
signed-out user to `/login` (remembering where they were headed), a signed-in
user without the required role to `/`.

`SiteShell` renders nothing but a spinner while `AuthContext.loading` is true, so
a refresh never flashes the wrong chrome — a signed-in user is not shown the
public navbar, and a visitor is not shown a sidebar built from a session that has
not arrived.

**Navigation is role-filtered from one table.** `layout/navItems.js` holds the
single list of sidebar/menu entries, each with an optional `roles` array:
`getNavItems(role)` returns only what that role may use — a `user` never
receives the Moderation or Admin entry, a `moderator` gets Moderation but not
Admin, and an `admin` gets both. The role comes from `AuthContext`, which reads
it from `/auth/me`; it is never taken from a form field or from `localStorage`.

The public navbar and the authenticated shell never render at the same time, and
there is exactly one login system.

## 17. Error handling

**Server.** Errors are funnelled to one handler (`error.middleware.js`) which
normalises everything into the failure envelope with a sensible status. Known
causes surface as `400` (validation), `401` (unauthenticated), `403`
(forbidden), `404` (not found), `409` (conflict), `429` (rate-limited) and
`500` (unexpected). A `404` handler catches unmatched routes.

**Client.** The Axios interceptor in `client/src/services/api.js` converts any
non-2xx response into an `ApiError` carrying `message`, `status` and optional
field `errors`. Pages render friendly messages (typically via `ErrorState` or
`Notice`) and never dump raw backend payloads at the user. 401 responses clear
the local session.

## 18. Testing & verification

- **Lint:** `cd client && npm run lint` (oxlint). The project aims for zero
  errors.
- **Build:** `cd client && npm run build` — catches import/syntax errors that a
  dev server can mask.
- **API tests:** `cd server && npm test` runs the Node test runner over
  `server/tests/**/*.test.js` (if present).
- **Seed check:** `cd server && npm run seed` — running it twice in a row should
  report `EXISTS` the second time (idempotency), and
  `NODE_ENV=production npm run seed` should refuse and exit non-zero.

**Manual smoke test.** With the API and Mongo running, walk the three roles in
order. The important checks are the *negative* ones — what a role must **not**
reach.

Public/guest:

- Home, Discussions, Categories all load; `/discussions/:id` opens a thread.
- `/dashboard` and `/profile` redirect to `/login` (no protected content flashes).

User (`register` a fresh account, or the seeded one is not needed):

- Register → lands on `/dashboard`; the sidebar shows Dashboard, Discussions,
  Categories, My Discussions, Profile — **no** Moderation, **no** Admin.
- The avatar shows initials, the dropdown shows name/email/Profile/Logout, and
  Logout returns to the public `/`.
- Create a discussion, reply, report, edit the profile.
- Going to `/moderation` or `/admin` bounces back to `/` (and the API returns
  `403` if called directly).

Moderator (`moderator@example.com`):

- Sidebar now includes **Moderation** but still **not** Admin.
- `/moderation` lists the report queue; dismiss/resolve a report; lock/remove a
  thread or reply.
- `/admin` still bounces to `/` (API returns `403`).

Admin (`admin@example.com`):

- Sidebar includes **Moderation** and **Admin**.
- `/admin` dashboard shows the live counters; user management (change a role,
  deactivate/reactivate), category management (create/edit/delete), the
  discussions/reports tables and the moderation history all load.

Security spot-checks:

- A password is never present in any API response (`/auth/me`, admin user lists).
- Registering with a `role` field does not produce anything but `user`.
- The JWT cookie is `HttpOnly` — `document.cookie` never contains `accessToken`.
- Anonymous calls to protected write endpoints return `401`, and wrong-role
  calls return `403` (not `200`).

Always verify changes against a **running API and a real database**; a passing
build proves it compiles, not that it works.

## 19. Building for production

**Frontend**

```bash
cd client
npm run build      # outputs to client/dist/
npm run preview    # optional local check of the built output
```

Serve `client/dist/` from any static host. Because the app uses client-side
routing, configure the host to fall back to `index.html` for unknown paths.

**Backend**

```bash
cd server
NODE_ENV=production npm start
```

In production the server requires `JWT_SECRET` to be at least 32 characters,
sets `trust proxy`, and uses `SameSite=None; Secure` cookies — so it must run
behind **HTTPS**, and `CLIENT_URL` must list the real frontend origin(s).

## 20. Troubleshooting

| Symptom                                                    | Likely cause / fix                                                                                 |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Server exits immediately with "Invalid environment configuration" | A required env var is missing/invalid. Read the listed problems in the error output.         |
| `GET /health` returns 200 but data calls fail              | The health route does not check the DB. Confirm MongoDB is reachable at your `MONGODB_URI`.         |
| Requests fail with CORS errors                             | `CLIENT_URL` on the server must exactly match the browser's origin (scheme, host, port).            |
| Signed-in state lost on refresh                            | The session comes from the httpOnly cookie; make sure Axios uses `withCredentials: true` and the API is reachable. |
| `401` right after login                                    | Cookie blocked (wrong `SameSite`/`secure` for your environment) or the API and app are on different sites without HTTPS. |
| White-on-white or invisible button text                    | A `bg-*`/`text-*` override collided with a variant — see the Tailwind v4 note in section 15.        |
| Discussion shows a category that no longer exists          | Category deletion does not cascade; the discussion was orphaned.                                    |
| Sent to `/login` immediately after signing in              | The session had not been read yet. Guards must render a loader while `AuthContext.loading` is true — see section 13. |
| Sidebar shows Admin/Moderation links to a normal user      | The role is being read from somewhere other than `AuthContext` (e.g. a form field or `localStorage`). Read it from `useAuth().role`. |
| Public navbar appears above the app for a signed-in user   | The route is not wrapped in `SiteShell` (or is inside `PublicShell`). Shared pages must go through `SiteShell` — see section 16. |
| Clicking Discussions/Categories in the sidebar leaves the app | Same cause: the route is rendering a fixed shell instead of `SiteShell`. |
| `npm run seed` refuses to run                              | `NODE_ENV=production` is set. The script is deliberately development-only — see section 10.         |
| Avatar shows the full name instead of initials             | Use `getInitials()` from `client/src/utils/name.js`; never print `user.name` in the navbar.         |
| Signed-in pages flash the wrong navigation on refresh      | A component is rendering role-specific UI before `AuthContext.loading` resolves to `false`.         |

## 21. Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the branching model, commit
style, PR checklist and coding conventions.
