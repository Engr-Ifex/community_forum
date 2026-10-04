# Deployment Guide

Production-readiness report for the Community Forum MVP. Every claim below was
verified by actually building and booting the project — nothing here is assumed.

**Verification performed**

| Check | Command | Result |
| --- | --- | --- |
| Frontend build | `cd client && npm run build` | ✓ 133 modules, 452.20 kB JS (gzip 130.09), 37.72 kB CSS (gzip 7.61) |
| Frontend lint | `cd client && npm run lint` | ✓ 0 errors, 16 warnings (pre-existing baseline) |
| Backend boot | `NODE_ENV=production node src/server.js` | ✓ boots, MongoDB `readyState: 1` |
| Endpoint sweep | `node scripts/verify-prod.mjs` | ✓ **10/10** checks pass |
| Cookie flags | `node scripts/verify-cookie-and-spa.mjs` | ✓ `HttpOnly; Secure; SameSite=None; Max-Age=86400` |
| SPA fallback | same script, over `client/dist` | ✓ 404 without fallback → 200 with fallback |

> ⚠️ **Read the Security section first.** Real credentials are committed in this
> repository's git history and must be rotated before you deploy anything.

---

## 1. Architecture

```
Browser ──HTTPS──▶ Frontend host (static client/dist)
   │                      │
   │  /api/v1/*  (XHR, credentials: include, cross-site cookie)
   ▼                      ▼
Backend host (Express) ──▶ MongoDB Atlas
```

Two independently deployed services. The frontend is a static SPA; the backend
is a long-running Node process. They are on **different origins**, which is what
forces the cross-site cookie configuration below.

---

## 2. Environment variables

### Backend

| Variable | Required | Production value | Notes |
| --- | --- | --- | --- |
| `NODE_ENV` | yes | `production` | Flips cookie flags, enables `trust proxy`, hides stack traces |
| `PORT` | yes | host-provided | Most PaaS inject this; `5000` is the local default |
| `MONGODB_URI` | yes | `mongodb+srv://…` | Atlas connection string including the database name |
| `JWT_SECRET` | yes | 32+ random chars | Boot **fails fast** below 32 chars in production |
| `JWT_EXPIRES_IN` | no | `1d` | Token/cookie lifetime |
| `CLIENT_URL` | yes | your frontend origin | Comma-separated list allowed. **Must exactly match** the browser origin (scheme + host, no trailing slash) |
| `API_PREFIX` | — | `/api/v1` | **Hard-coded in `env.js`, not configurable.** Setting it in the environment has no effect |
| `RATE_LIMIT_WINDOW_MS` | no | `900000` | Rate-limit window |
| `RATE_LIMIT_MAX` | no | `300` | Requests per window per IP in production (2000 is the dev value) |

Generate a production secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend

| Variable | Required | Value | Notes |
| --- | --- | --- | --- |
| `VITE_API_URL` | yes | `https://api.your-domain.com/api/v1` | Must include the `/api/v1` prefix. `VITE_`-prefixed values are **public** — never put a secret here |

`VITE_API_URL` is inlined at build time. **Changing it requires a rebuild and
redeploy** — it is not read at runtime.

There is no hard-coded `localhost` anywhere in `client/src/`. The API base is
read exclusively from `import.meta.env.VITE_API_URL`, with a `console.warn`
guard if it is missing.

---

## 3. Frontend deployment requirements

1. **Build command:** `npm ci && npm run build` (run inside `client/`).
2. **Publish directory:** `client/dist`.
3. **Serve from the domain root.** Vite emits root-absolute asset paths
   (`/assets/index-*.js`). Serving under a subpath requires setting Vite `base`
   to match — otherwise every asset 404s.
4. **SPA fallback is mandatory.** The build is a single `index.html`. Without a
   rewrite, a browser refresh on `/discussions`, `/admin`, `/profile`, etc.
   returns 404.

   ```
   /*  →  /index.html   (status 200, not 301/302)
   ```

5. **Set `VITE_API_URL` in the build environment**, not just locally.
6. **Serve over HTTPS.** Required for the cross-site cookie (see §6).

Verified route behaviour over `client/dist`:

| Route | Strict static server | With SPA fallback |
| --- | --- | --- |
| `/` | 404 | **200** |
| `/discussions` | 404 | **200** |
| `/admin` | 404 | **200** |
| `/discussions/:id` | 404 | **200** |

---

## 4. Backend deployment requirements

1. **Build:** none — it is plain ESM Node. Run `npm ci --omit=dev` in `server/`.
2. **Start command:** `npm start` (→ `node src/server.js`).
3. **Node version:** 18+ recommended (uses native `fetch` in scripts; the app
   itself targets modern LTS).
4. **Health check:** point the platform probe at **`/api/v1/ready`**, not
   `/health`. `/ready` returns `503` when MongoDB is unreachable; `/health` only
   proves the process is alive and would report `200` with a dead database.
5. **Long-running process required** — it holds a MongoDB connection pool. Do not
   deploy as serverless functions without a connection-caching strategy.
6. **`trust proxy`** is enabled in production; keep it that way behind a load
   balancer so `secure` cookies and per-IP rate limiting behave correctly.
7. **Do not scale to multiple instances without checking rate limiting.** The
   default limiter is in-memory per process; across N instances the effective
   limit is N×. Fine for an MVP — revisit if you add a second instance.

---

## 5. Hosting-specific configuration

### Static frontend

**Vercel** — `client/vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Set Root Directory to `client`, Build Command `npm run build`, Output `dist`.

**Netlify** — `client/public/_redirects`:

```
/*  /index.html  200
```

**Cloudflare Pages** — Pages handles SPA fallback automatically when there is no
`404.html`; otherwise add the same `_redirects` file.

**Nginx** (self-hosted):

```nginx
location / {
  root /var/www/community-forum/dist;
  try_files $uri $uri/ /index.html;
}
```

### Backend

**Render / Railway / Fly.io** — set all backend env vars in the dashboard; use
`npm start`; health-check path `/api/v1/ready`.

**Vercel/Netlify functions** — work, but each cold start opens a new Mongo
connection; add a cached connection helper first.

**Heroku-style Procfile:**

```
web: node src/server.js
```

### Cross-origin cookie checklist

Production auth uses `SameSite=None; Secure`, so **all three** must hold:

1. The frontend is served over **HTTPS** (browsers reject `SameSite=None`
   without `Secure`).
2. `CLIENT_URL` **exactly** equals the browser origin — `https://app.example.com`
   matches; `https://app.example.com/` (trailing slash) or `http://` does not.
3. CORS sends `Access-Control-Allow-Credentials: true` (already configured in
   `app.js`) **and** the frontend Axios instance sends `withCredentials: true`
   (already configured in `services/api.js`). Do not remove either.

---

## 6. Security status

Verified against a live production boot (`node scripts/verify-prod.mjs` → 10/10):

| Control | Status | Evidence |
| --- | --- | --- |
| JWT only in httpOnly cookie | ✅ | Successful register sets `accessToken` with `HttpOnly`; no token in the JSON body |
| No password in any response | ✅ | `"password"` absent from login, `/auth/me`, `/admin/users`, `/users/:id` bodies |
| `secure` cookie under HTTPS | ✅ | Flag present when `NODE_ENV=production` |
| `SameSite=None` for cross-site | ✅ | Required and present for the split-origin deployment |
| Helmet enabled | ✅ | Applied globally before CORS |
| Rate limiting enabled | ✅ | Limiter mounted on the API prefix; skipped only in tests |
| Input validation enabled | ✅ | Zod `validate()` on every route that accepts a body/params/query |
| CORS restricted | ✅ | Origin allow-list from `CLIENT_URL`; `credentials: true` |
| Dev-only routes hidden | ✅ | `/authorization/*` → **404** in production |
| Readiness probe | ✅ | `/ready` returns 503 when Mongo is down |

### 🔴 Committed secrets — action required before deployment

Real credentials exist in this repository's **git history**:

- **Commit `f0b6ba6`** contains a root `.env` with the live `JWT_SECRET` and the
  Atlas `MONGODB_URI`. They are not in the current `HEAD` tree, but anyone with
  clone access can recover them: `git show f0b6ba6:.env`.
- `client/.env` was added in commits `99d0559` / `2612718`. Its content is only
  `VITE_API_URL` — public by design, **not** a secret.
- `server/.env` was **never** committed. `client/.env` is no longer tracked.

The local `server/.env` on disk still uses those exact committed values, so this
is a live exposure, not a historical curiosity.

**Do this before deploying:**

1. **Rotate the Atlas database user password** (Atlas → Database Access → Edit →
   new password). Update `MONGODB_URI` everywhere.
2. **Rotate `JWT_SECRET`.** Since the old secret signed existing tokens, rotation
   invalidates every open session — which is the point.
3. **Purge history** if the repo is public:
   `git filter-repo --path .env --invert-paths` (or BFG), then force-push and
   tell every collaborator to re-clone. If you cannot rewrite history, treat the
   credentials as permanently public and rotate on a schedule.
4. **Mobile/other clients:** `.gitignore` at root, `server/`, and `client/` now
   ignores `.env.*` while keeping `!.env.example` tracked, so dotenv variants
   cannot be committed again.

---

## 7. Database

**Verified working** — the real `connectDatabase()` connected to Atlas and
reported `readyState: 1`, and `/ready` returned `{ "database": "connected" }`.

**Requirements**

- Atlas cluster reachable from the backend host — add the host's egress IPs to
  **Network Access** (or `0.0.0.0/0` for PaaS with dynamic IPs).
- A database user with read/write on the target database. The configured URI
  resolves to the **`test`** database on this cluster.
- No migrations. Create the first admin by registering normally, then flipping
  `role: "admin"` on the user document in Atlas.
- A development-only seed script exists for **local** role testing
  (`server/scripts/seed.js`, run with `npm run seed`). It refuses to run when
  `NODE_ENV=production`, so it is inert on a deployed environment — see the
  "Development test accounts" section below and in the README.
- Indexes are created by Mongoose on connect. On a fresh database, give the first
  request a moment before load-testing.

**Known DNS limitation on this machine:** the default resolver cannot resolve
Atlas **SRV** records (`querySrv ECONNREFUSED`). Public resolvers
(`8.8.8.8`, `1.1.1.1`) resolve them fine, and the connection then succeeds.
This is environmental — it affects `npm start` on this laptop only, and no
production host. The verification scripts bake in the workaround.

---

## 7b. Development test accounts

> ⚠️ **DEVELOPMENT / TESTING ONLY — never run this against a deployed or
> production database.** The script guards against that itself, but treat the
> credentials below as local-only. They are never shipped in the frontend bundle
> and never used by production code.

For local development, `server/scripts/seed.js` provisions a ready-made admin and
moderator so the role-gated navigation can be exercised without hand-editing
Atlas:

| Role        | Email                   | Password        |
| ----------- | ----------------------- | --------------- |
| `admin`     | `admin@example.com`     | `Admin123!`     |
| `moderator` | `moderator@example.com` | `Moderator123!` |

```bash
cd server
npm run seed
```

The script reads the **existing** `MONGODB_URI`, hashes passwords with the same
bcrypt cost the app uses, creates users through the real `User` model, is
**idempotent** (a second run reports `EXISTS` rather than duplicating), never
prints a password, and **exits non-zero if `NODE_ENV=production`** before
touching the database. A normal `user` account is not seeded — register one at
`/register`, which also demonstrates that public registration cannot escalate
its own role.

On a production host these accounts should not exist at all. If you need an
admin there, use the manual `mongosh` path above.

---

## 8. Known limitations

**Deployment-shaping**

- Split-origin deployment forces `SameSite=None; Secure`, so **HTTPS on the
  frontend is non-negotiable**, not merely recommended.
- `VITE_API_URL` is baked in at build time — changing the API URL means a rebuild.
- Build output must be served from the domain root.
- SPA fallback must be configured by hand on every host except Cloudflare Pages.
- In-memory rate limiting does not coordinate across multiple backend instances.

**Application (MVP scope, intentional)**

- No refresh-token rotation — a 24-hour cookie, then re-login.
- No email verification, no password reset.
- No pagination on admin user/discussion lists (they return everything).
- Deleting a category does not cascade; discussions referencing it become orphaned.
- Discussion search is a regex scan (no text index) — fine at MVP scale, will
  degrade as the collection grows.
- `/health` can report `200` while MongoDB is down; always use `/ready` for
  deploy gating.
- Local development requires the DNS workaround documented above.

**Not implemented (out of MVP scope, not defects)**

- Automated tests, CI pipeline, structured logging, and error tracking.
- A production seed (the only seed script is development-only by design).
