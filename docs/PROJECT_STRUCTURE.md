# Project Structure

A file-by-file map of the codebase, so a new contributor knows where things
live and what belongs where. See the [README](../README.md) for setup and
[docs/API.md](API.md) for the endpoint reference.

---

## Top level

```
community_forum/
├─ client/                  # React + Vite single-page app
├─ server/                  # Express + MongoDB REST API
├─ docs/                    # this documentation
├─ CONTRIBUTING.md
├─ README.md
└─ .gitignore
```

The two apps are independently installable and independently runnable. They
share nothing but the HTTP contract, which is why the API is documented
separately from either implementation.

---

## Backend — `server/`

```
server/
├─ src/
│  ├─ config/
│  │  ├─ env.js             # loads .env, validates every variable, exports `env`
│  │  └─ database.js        # Mongoose connect / disconnect
│  ├─ constants/
│  │  └─ index.js           # HTTP_STATUS, API_MESSAGES, REQUEST_TARGETS
│  ├─ controllers/          # one per resource — thin request/response shaping
│  │  ├─ auth.controller.js
│  │  ├─ user.controller.js
│  │  ├─ category.controller.js
│  │  ├─ discussion.controller.js
│  │  ├─ reply.controller.js
│  │  ├─ report.controller.js
│  │  ├─ moderation.controller.js
│  │  └─ admin.controller.js
│  ├─ middleware/
│  │  ├─ auth.middleware.js       # `authenticate` — reads the accessToken cookie
│  │  ├─ role.middleware.js       # `authorize`, `requireModerator`, `requireAdmin`
│  │  ├─ validation.middleware.js # `validate({ body, params, query })` — Zod
│  │  ├─ rateLimit.middleware.js  # `apiLimiter`
│  │  ├─ notFound.middleware.js   # unmatched-route 404
│  │  └─ error.middleware.js      # the single global error handler
│  ├─ models/               # Mongoose schemas
│  │  ├─ User.js
│  │  ├─ Category.js
│  │  ├─ Discussion.js
│  │  ├─ Reply.js
│  │  ├─ Report.js
│  │  └─ ModerationAction.js
│  ├─ routes/               # URL wiring; validation + guards attached here
│  │  ├─ index.routes.js    # mounts every feature router under /api/v1
│  │  ├─ auth.routes.js
│  │  ├─ authorization.routes.js
│  │  ├─ user.routes.js
│  │  ├─ category.routes.js
│  │  ├─ discussion.routes.js
│  │  ├─ reply.routes.js
│  │  ├─ report.routes.js
│  │  ├─ moderation.routes.js
│  │  └─ admin.routes.js
│  ├─ services/             # business logic + Mongoose queries (one per resource)
│  ├─ utils/
│  │  ├─ apiResponse.js     # successResponse / errorResponse / createdResponse
│  │  ├─ asyncHandler.js    # wraps async controllers so rejections reach the handler
│  │  └─ generateToken.js   # signs the JWT
│  ├─ validators/           # Zod schemas, one per resource
│  ├─ app.js                # Express wiring (no listening) — importable by tests
│  └─ server.js             # process lifecycle: connect DB, listen, graceful shutdown
├─ scripts/                 # local helper scripts (e.g. seed-verify.mjs)
├─ .env.example
└─ package.json
```

### The request lifecycle

```
HTTP request
  └─ app.js            helmet → cors → cookies → morgan → rate limit
       └─ routes/      match URL; run validate(...) (Zod) and authenticate/requireX
            └─ controllers/   read req, call one service, send the envelope
                 └─ services/  enforce rules, query Mongoose
                      └─ models/  schema + indexes → MongoDB
  (any throw) ──► middleware/error.middleware.js ──► the failure envelope
```

**Where does new code go?**

- A new URL → `routes/`.
- A new rule or query → `services/`.
- A new request shape → `validators/` (then reference it in the route).
- A new field → the relevant `models/` schema *and* the validator.

Keep controllers thin: they should parse the request, call exactly one service,
and shape the response. Business logic belongs in services so it can be reused
and tested without HTTP.

---

## Frontend — `client/`

```
client/
├─ src/
│  ├─ components/
│  │  ├─ common/            # cross-cutting, used everywhere
│  │  │  ├─ ui.jsx          # ★ the design system (buttons, fields, states, icons)
│  │  │  ├─ Navbar.jsx      # site nav, role-gated links, mobile disclosure
│  │  │  ├─ Footer.jsx
│  │  │  ├─ Loader.jsx
│  │  │  ├─ ErrorMessage.jsx
│  │  │  └─ NotFound.jsx
│  │  ├─ Home/              # landing page, composed of sections
│  │  │  ├─ Home.jsx        # page shell + data loading
│  │  │  ├─ Hero.jsx
│  │  │  ├─ FeatureHighlights.jsx
│  │  │  ├─ CategoryTile.jsx
│  │  │  ├─ RecentDiscussionCard.jsx
│  │  │  └─ FinalCta.jsx    # the one dark surface (uses inverseButtonClass)
│  │  ├─ Login/Login.jsx
│  │  ├─ Register/Register.jsx
│  │  ├─ Discussions/
│  │  │  ├─ Discussions.jsx               # list + search/filter/sort/pagination
│  │  │  ├─ DiscussionCard.jsx
│  │  │  ├─ DiscussionDetails.jsx         # ★ the ONLY detail component
│  │  │  ├─ CreateDiscussion.jsx
│  │  │  ├─ EditDiscussion.jsx
│  │  │  ├─ ReplyItem.jsx
│  │  │  └─ DeleteDiscussionConfirmation.jsx
│  │  ├─ Categories/
│  │  │  ├─ Categories.jsx
│  │  │  ├─ CategoryCard.jsx
│  │  │  ├─ CategoryPage.jsx
│  │  │  ├─ CategoryFormDialog.jsx
│  │  │  └─ CategoryDeleteDialog.jsx
│  │  ├─ Profile/
│  │  │  ├─ Profile.jsx
│  │  │  ├─ ProfileEditForm.jsx
│  │  │  └─ Avatar.jsx
│  │  ├─ Reports/ReportDialog.jsx
│  │  ├─ Moderation/
│  │  │  ├─ Moderation.jsx
│  │  │  ├─ ReportRow.jsx
│  │  │  └─ ModerationActionDialog.jsx
│  │  └─ Admin/
│  │     ├─ Admin.jsx                # console shell + tabs
│  │     ├─ AdminOverview.jsx
│  │     ├─ AdminUsers.jsx
│  │     ├─ AdminCategories.jsx
│  │     ├─ AdminDiscussions.jsx
│  │     ├─ AdminReports.jsx
│  │     ├─ AdminModerationHistory.jsx
│  │     ├─ AdminConfirmDialog.jsx
│  │     └─ adminFormat.js           # shared admin formatting helpers
│  ├─ context/AuthContext.jsx    # session state; exposes useAuth()
│  ├─ routes/ProtectedRoute.jsx  # role-aware route guard
│  ├─ services/                  # one module per API resource
│  │  ├─ api.js                  # ★ the single Axios instance + interceptors
│  │  ├─ auth.js
│  │  ├─ users.js
│  │  ├─ categories.js
│  │  ├─ discussions.js
│  │  ├─ replies.js
│  │  ├─ reports.js
│  │  ├─ moderation.js
│  │  └─ admin.js
│  ├─ utils/identity.js          # `getId`, `isSameId` — safe _id/id reads
│  ├─ App.jsx                    # router + page shell
│  ├─ main.jsx                   # React root
│  └─ index.css                  # Tailwind entry (only @import "tailwindcss")
├─ .env.example
└─ package.json
```

### Data-flow rules (important)

1. **Never create a second Axios instance.** `services/api.js` owns the base
   URL, `withCredentials`, and the response interceptor that unwraps the
   server's success envelope. Its interceptor resolves with `response.data`, so
   callers read `response.data.<resource>` — e.g. `response.data.discussions`.
2. **The session comes from the cookie, never localStorage.** Session validity
   is decided only by `GET /auth/me`, which `AuthContext` calls on startup.
3. **`AuthContext` exposes exactly**: `user`, `isAuthenticated`, `loading`,
   `role`, `login`, `register`, `logout`, `refreshUser`. The loading flag is
   `loading`. Renaming a key silently breaks any consumer that reads it (it
   becomes `undefined`, not a lint error) — grep every `useAuth()` call site
   before renaming.
4. **Read ids defensively.** Mongoose serialises as `_id` and the `id` virtual
   is not enabled, so use `obj?._id ?? obj?.id` (see `utils/identity.js`).
5. **One detail component.** `Discussions/DiscussionDetails.jsx` is the single
   discussion-detail component, routed at `/discussions/:id`. There is no
   `DiscussionDetail.jsx`.
6. **All styling flows through `common/ui.jsx`.** New buttons, inputs, cards and
   empty/error states should reuse the exported helpers rather than hand-rolling
   colours — this is what keeps every page consistent with Home. See the
   Tailwind v4 note in the README before overriding a variant's colour.
