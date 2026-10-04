# Contributing

Thanks for helping improve Community Forum. This guide covers the workflow,
conventions and checklist we expect, so changes land smoothly.

By contributing you agree that your work may be distributed under the project's
license.

---

## Before you start

- Read the [README](README.md) for setup and the
  [API reference](docs/API.md) for the contract between the two apps.
- Make sure you can run both apps locally (MongoDB + `server` + `client`)
  before touching code.
- Search existing issues/PRs first so you don't duplicate work.

---

## Branching model

Work flows **outward from `development` and back into it**; `master` is the
stable line. Never commit directly to `master` or `development`.

```
master                 ← stable, release-ready
  └─ development       ← integration branch; features merge here
       ├─ feature/<short-name>     new functionality
       ├─ fix/<short-name>         bug fixes
       ├─ docs/<short-name>        documentation only
       └─ chore/<short-name>       tooling, deps, housekeeping
```

**Flow**

```
1. Branch from development
       git checkout development
       git pull origin development
       git checkout -b feature/your-feature

2. Commit your work (small, focused commits)

3. Keep up to date
       git fetch origin
       git rebase origin/development      # or merge, team preference

4. Push and open a Pull Request
       git push -u origin feature/your-feature
       # open a PR targeting `development`

5. Review → address feedback → get approval

6. Merge into development (squash or merge, per repo setting)

7. development is promoted to master for a release
```

Name branches in `kebab-case` after the work, e.g.
`feature/report-reasons`, `fix/navbar-mobile-close`, `docs/api-examples`.

---

## Commit messages

Write in the imperative mood, in one short line, optionally with a body:

```
Add rate limit to report creation

The reports endpoint could be hammered; reuse the shared
apiLimiter so it matches the rest of the API.
```

- Start with a capitalised verb: *Add*, *Fix*, *Remove*, *Refactor*, *Document*.
- Describe **what and why**, not "changes" or "wip".
- Keep the subject under ~72 characters.
- Reference an issue in the body if one exists (`Refs #42`).

---

## Pull requests

Before opening a PR, confirm:

- [ ] The branch is up to date with `development` and merges cleanly.
- [ ] `cd client && npm run lint` reports **no errors**.
- [ ] `cd client && npm run build` succeeds.
- [ ] You exercised the affected flows against a **running API and database** —
      a passing build proves it compiles, not that it works.
- [ ] No `.env` files, secrets, credentials or real connection strings are
      included.
- [ ] Documentation is updated when behaviour or the API changes
      (`README.md`, `docs/API.md`, `docs/PROJECT_STRUCTURE.md`).
- [ ] The PR description states what changed, why, and how you verified it
      (include the actual commands you ran).

A reviewer should be able to reproduce your result from the description alone.
Keep PRs small and single-purpose — a focused PR is reviewed far faster.

---

## Coding conventions

### General

- Match the style of the surrounding code; consistency beats personal taste.
- Prefer small, named functions over long inline blocks.
- Comment the **why** (a non-obvious decision, a constraint), not the obvious
  **what**.
- Don't add a dependency for something the standard library or an existing
  dependency already does — especially on the frontend, where every kilobyte
  ships to the user.

### Backend (`server/`)

- Respect the layering: `routes → controllers → services → models`.
  Controllers stay thin; business logic and queries live in services.
- Validate every request boundary with a Zod schema in `validators/` and attach
  it with `validate({ body, params, query })` in the route.
- Wrap async controllers with `asyncHandler` so rejections reach the global
  error handler; never `try/catch` just to re-throw the same error.
- Throw `http-errors` (`createError(404, "…")`) for expected failures; the error
  middleware normalises them into the failure envelope.
- Respond through the helpers in `utils/apiResponse.js` so the envelope shape
  never drifts. New responses must keep `{ success, message, data? }`.
- Guard privileged routes with `authenticate` plus `requireModerator` /
  `requireAdmin`.
- Never send a `password` field; the model excludes it (`select: false`) — keep
  it that way in any new projection.

### Frontend (`client/`)

- **One Axios instance.** All calls go through `services/api.js`. Add a resource
  module in `services/` rather than calling Axios directly.
- **Session from the cookie.** Never mirror the user into `localStorage`; let
  `AuthContext` / `GET /auth/me` be the source of truth.
- **Use the design system.** Build UI from the helpers in
  `components/common/ui.jsx` (`buttonClass`, `inputClass`, `selectClass`,
  `textareaClass`, `labelClass`, `Notice`, `EmptyState`, `ErrorState`,
  `PageHeader`, …) instead of hand-rolling colours. This is what keeps every
  page consistent with the Home page.
- **Never override a variant's colour** through the `extra` argument of
  `buttonClass` (`bg-*` / `text-*`). Tailwind v4 decides the winner by its own
  property order, which silently produces unreadable buttons. Compose a
  separate class string when you need something off-system (see
  `inverseButtonClass`).
- **Read ids safely:** `obj?._id ?? obj?.id`.
- **Show real states.** Every data view handles loading (skeletons), empty
  (`EmptyState`) and error (`ErrorState` with retry) — and never surfaces a raw
  backend payload; show a friendly sentence instead.

---

## Adding a feature end-to-end

The typical path for a new resource or field:

1. **Model** — add the field/schema in `server/src/models/`.
2. **Validator** — add or extend the Zod schema in `server/src/validators/`.
3. **Service** — implement the rule/query in `server/src/services/`.
4. **Controller** — expose it, shaping the response envelope.
5. **Route** — wire the URL with `validate(...)` and the right role guard.
6. **API docs** — add the endpoint to `docs/API.md`.
7. **Client service** — add the call in `client/src/services/`.
8. **UI** — build it from `common/ui.jsx` primitives; handle loading/empty/error.
9. **Verify** — lint, build, and exercise the flow against a live API + DB.

---

## Reporting bugs

Include:

- What you did, what you expected, and what actually happened.
- Exact reproduction steps.
- The environment (OS, Node version, browser).
- Relevant server logs or the API response body (redact anything sensitive).

## Security

Do **not** open a public issue for a security problem. Report it privately to
the maintainers instead. Never commit real secrets — `.env` is git-ignored for a
reason; keep using `.env.example` as the template.
