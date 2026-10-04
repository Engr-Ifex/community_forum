# API Reference

Base URL: **`/api/v1`** (configurable `PORT`, default `5000`, so locally
`http://localhost:5000/api/v1`).

This document describes the endpoints that are actually implemented in
`server/src/routes`, with the request shapes enforced by `server/src/validators`
and the response shapes produced by `server/src/controllers` and `-services`.

---

## Conventions

### Response envelope

Every response — success or failure — uses the same envelope.

**Success**

```jsonc
{
  "success": true,
  "message": "Human-readable summary",
  "data": { /* resource keys, omitted when a response carries no payload */ }
}
```

**Failure**

```jsonc
{
  "success": false,
  "message": "Human-readable summary",
  "errors": [ { "path": "field", "message": "…" } ]   // present on validation errors
}
```

### Authentication

The API authenticates with a JWT stored in an **httpOnly cookie** named
`accessToken`. It is set automatically on `POST /auth/register` and
`POST /auth/login`, and cleared by `POST /auth/logout`. Clients must send
cookies (`withCredentials`) and cannot read the token from JavaScript.

Endpoints marked **Auth** require the cookie. Endpoints marked
**Moderator**/**Admin** additionally require that role.

### Status codes

| Code | Meaning                                                  |
| ---- | -------------------------------------------------------- |
| 200  | Success (most reads and updates)                         |
| 201  | Created (register, and any `POST` that creates a resource) |
| 400  | Validation failed                                        |
| 401  | Not authenticated (missing/invalid cookie)               |
| 403  | Authenticated but not permitted (wrong role)             |
| 404  | Resource or route not found                              |
| 409  | Conflict (e.g. duplicate report, duplicate category name) |
| 429  | Rate limit exceeded                                       |

### Identifiers

All IDs are 24-character hexadecimal MongoDB ObjectIds. Every path parameter
`id` is validated against `/^[0-9a-fA-F]{24}$/` and rejected with `400`
otherwise. Resources serialise as **`_id`** (no `id` virtual).

---

## Health & root

### `GET /`

Returns the API banner. Public.

```bash
curl http://localhost:5000/api/v1/
```

```json
{ "success": true, "message": "Community Forum API" }
```

### `GET /health`

Liveness check. Public. Note: this does **not** verify the database connection —
it answers as long as the process is up.

```json
{ "success": true, "message": "Community Forum API is running" }
```

### `GET /ready`

Readiness check. Public. Verifies the MongoDB connection (`readyState === 1`).

`200` when the database is connected:

```json
{
  "success": true,
  "message": "Community Forum API is running",
  "data": { "database": "connected" }
}
```

`503` when it is not:

```json
{
  "success": false,
  "message": "Community Forum API is running but the database is unavailable"
}
```

Use `/health` for a container liveness probe and `/ready` for a readiness
probe or an upstream health gate.

---

## Auth — `/auth`

### `POST /auth/register`

Create an account and start a session. Public. Sets the `accessToken` cookie.

**Body**

| Field    | Type   | Rules                                             |
| -------- | ------ | ------------------------------------------------- |
| `name`   | string | required, trimmed, 2–100 chars                    |
| `email`  | string | required, valid email, lowercased                |
| `password` | string | required, 8–128 chars                          |
| `avatar` | string | optional, must be a valid URL                     |
| `bio`    | string | optional, ≤ 500 chars                             |

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"name":"Ada","email":"ada@example.com","password":"Passw0rd!23"}'
```

**`201`**

```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "_id": "6ac193475ca2842214fa3e07",
      "name": "Ada",
      "email": "ada@example.com",
      "role": "user",
      "avatar": null,
      "bio": "",
      "isActive": true,
      "createdAt": "2026-10-03T23:44:07.468Z",
      "updatedAt": "2026-10-03T23:44:07.468Z"
    }
  }
}
```

Errors: `400` validation, `409` email already in use.

### `POST /auth/login`

Start a session. Public. Sets the `accessToken` cookie.

**Body** — `email` (valid, lowercased), `password` (non-empty).

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"ada@example.com","password":"Passw0rd!23"}'
```

**`200`** — `{ "success": true, "message": "Login successful", "data": { "user": … } }`

Errors: `400` validation, `401` invalid credentials, `403` account deactivated.

### `POST /auth/logout`

Clear the session cookie. Public.

**`200`** — `{ "success": true, "message": "Logout successful" }`

### `GET /auth/me`

Return the current session's user. **Auth.** This is the frontend's source of
truth for whether a session is valid.

**`200`**

```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": { "user": { "_id": "…", "name": "Ada", "role": "user", "…": "…" } }
}
```

Errors: `401` when the cookie is missing or invalid.

---

## Authorization probes — `/authorization`

Small role-check endpoints, useful for verifying guards and for tests.

| Endpoint                     | Access                 | Body keys returned                     |
| ---------------------------- | ---------------------- | -------------------------------------- |
| `GET /authorization/user`      | any authenticated user | `{ userId, role }`                     |
| `GET /authorization/moderator` | moderator + admin      | `{ userId, role }`                     |
| `GET /authorization/admin`     | admin only             | `{ userId, role }`                     |

Each returns `{ "success": true, "message": "… access granted", "data": { "userId", "role" } }`,
or `403` when the role is insufficient.

---

## Users — `/users`

### `GET /users/:id`

Public profile: the user plus their authored content. Public.

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": { "_id": "…", "name": "Ada", "avatar": null, "bio": "", "createdAt": "…" },
    "discussions": [ /* discussions authored by this user */ ],
    "replies": [ /* replies authored by this user */ ]
  }
}
```

Errors: `400` invalid ID, `404` user not found.

### `PATCH /users/:id`

Update your own profile. **Auth**, and only the account owner (a different user's
ID is rejected with `403`).

**Body** — at least one of:

| Field    | Type           | Rules                        |
| -------- | -------------- | ---------------------------- |
| `name`   | string         | 2–100 chars                  |
| `bio`    | string         | ≤ 500 chars                  |
| `avatar` | string \| null | valid URL, or `null` to clear |

**`200`** — `{ "success": true, "message": "User profile updated successfully", "data": { "user": … } }`

---

## Categories — `/categories`

### `GET /categories`

List all categories. Public.

```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      {
        "_id": "6ac193485ca2842214fa3e0c",
        "name": "announcements",
        "description": "Official news from the team.",
        "createdBy": "6ac193475ca2842214fa3e07",
        "createdAt": "…",
        "updatedAt": "…"
      }
    ]
  }
}
```

> The category list is nested under **`data.categories`** (not a bare array).

### `GET /categories/:id`

One category. Public. → `data: { category }`. Errors: `400`, `404`.

### `POST /categories`

Create a category. **Admin.**

**Body** — `name` (2–100, required, stored lowercase, unique), `description`
(≤ 500, optional).

**`201`** — `{ "success": true, "message": "Category created successfully", "data": { "category": … } }`

Errors: `400`, `409` duplicate name.

### `PATCH /categories/:id`

Update a category. **Admin.** Body: at least one of `name`, `description`.

**`200`** — `data: { category }`.

### `DELETE /categories/:id`

Delete a category. **Admin.**

**`200`** — `{ "success": true, "message": "Category deleted successfully" }`

> Deleting a category does **not** cascade to its discussions.

---

## Discussions — `/discussions`

### `GET /discussions`

List discussions. Public. Supports filtering, sorting and pagination.

**Query parameters**

| Param      | Type   | Default  | Notes                                                         |
| ---------- | ------ | -------- | ------------------------------------------------------------- |
| `search`   | string | —        | ≤ 200 chars. Matches title/content (regex scan).              |
| `category` | ObjectId | —      | Restrict to one category.                                     |
| `page`     | int    | `1`      | ≥ 1.                                                          |
| `limit`    | int    | `10`     | 1–50.                                                         |
| `sort`     | enum   | `latest` | `latest` \| `oldest` \| `popular`.                            |

```bash
curl "http://localhost:5000/api/v1/discussions?search=design&sort=popular&page=1&limit=10"
```

**`200`**

```json
{
  "success": true,
  "message": "Discussions retrieved successfully",
  "data": {
    "discussions": [ /* … */ ],
    "pagination": {
      "currentPage": 1,
      "limit": 10,
      "totalItems": 42,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### `GET /discussions/:id`

One discussion. Public. Increments the view count.

**`200`** — `data: { discussion }`. Errors: `400`, `404`.

### `POST /discussions`

Create a discussion. **Auth.**

**Body**

| Field      | Type     | Rules                |
| ---------- | -------- | -------------------- |
| `title`    | string   | 3–200 chars          |
| `content`  | string   | 10–10000 chars       |
| `category` | ObjectId | must be a valid ID   |

**`201`** — `{ "success": true, "message": "Discussion created successfully", "data": { "discussion": … } }`

Errors: `400`, `404` category not found.

### `PATCH /discussions/:id`

Edit a discussion. **Auth** — the author, a moderator, or an admin.

**Body** — at least one of `title`, `content`, `category` (same rules as create).

**`200`** — `data: { discussion }`. Errors: `400`, `403`, `404`.

### `DELETE /discussions/:id`

Delete a discussion. **Auth** — the author, a moderator, or an admin.

**`200`** — `{ "success": true, "message": "Discussion deleted successfully" }`

---

## Replies

Routes use the `discussion_id` or `reply_id` as appropriate.

### `GET /discussions/:id/replies`

List a discussion's replies. Public. → `data: { replies }`.

### `POST /discussions/:id/replies`

Create a reply. **Auth.** Body: `content` (1–5000 chars, required).

**`201`** — `{ "success": true, "message": "Reply created successfully", "data": { "reply": … } }`

Errors: `400`, `404` discussion not found, `403` discussion locked/removed.

### `PATCH /replies/:id`

Edit a reply. **Auth** — the author, a moderator, or an admin. Body: `content`
(1–5000).

**`200`** — `data: { reply }`.

### `DELETE /replies/:id`

Delete a reply. **Auth** — the author, a moderator, or an admin.

**`200`** — `{ "success": true, "message": "Reply deleted successfully" }`

---

## Reports — `/reports`

### `POST /reports`

Report a discussion **or** a reply. **Auth.**

**Body** — exactly one of `discussion` / `reply`, plus a `reason`:

| Field        | Type     | Rules                                             |
| ------------ | -------- | ------------------------------------------------- |
| `discussion` | ObjectId | optional; mutually exclusive with `reply`         |
| `reply`      | ObjectId | optional; mutually exclusive with `discussion`    |
| `reason`     | string   | 3–1000 chars, required                            |

**`201`** — `{ "success": true, "message": "Report submitted successfully", "data": { "report": … } }`

Errors: `400` (neither/both targets, validation), `404` target not found,
`409` you have already reported this content.

### `GET /reports`

List all reports. **Moderator/Admin.** → `data: { reports }`, newest first, with
`reportedBy`, `discussion`, `reply` and `reviewedBy` populated.

### `GET /reports/:id`

One report plus its reported content. **Moderator/Admin.** → `data: { report }`.

---

## Moderation — `/moderation`

All endpoints require **moderator or admin**. The body accepts an optional
`reason` (≤ 1000 chars) recorded in the moderation log.

| Endpoint                                    | Action                          |
| ------------------------------------------- | ------------------------------- |
| `PATCH /moderation/reports/:id/dismiss`     | Dismiss a report                |
| `PATCH /moderation/reports/:id/resolve`     | Resolve a report                |
| `PATCH /moderation/discussions/:id/lock`    | Lock a discussion               |
| `DELETE /moderation/discussions/:id`        | Remove a discussion             |
| `DELETE /moderation/replies/:id`            | Remove a reply                  |

Each succeeds with `200` and a message such as
`"Discussion locked successfully"` / `"Report dismissed successfully"`, plus a
`data` payload describing the affected resource.

Errors: `400` invalid ID/reason, `403` insufficient role, `404` not found.

---

## Admin — `/admin`

All endpoints require **admin**.

### `GET /admin/dashboard`

Platform statistics.

```json
{
  "success": true,
  "message": "Admin dashboard retrieved successfully",
  "data": {
    "dashboard": {
      "users":       { "total": 12, "active": 11, "inactive": 1, "moderators": 2 },
      "categories":  { "total": 5 },
      "discussions": { "total": 40, "active": 38, "locked": 1, "removed": 1 },
      "reports":     { "total": 9, "pending": 3, "resolved": 4, "dismissed": 2 },
      "moderation":  { "totalActions": 7 }
    }
  }
}
```

### `GET /admin/users`

List users (passwords excluded), newest first. → `data: { users }`.

### `GET /admin/users/:id`

One user. → `data: { user }`.

### `PATCH /admin/users/:id`

Update a user's role and/or active status. Body: at least one of `role`
(`user`|`moderator`|`admin`), `isActive` (boolean).

**`200`** — `{ "success": true, "message": "User updated successfully", "data": { "user": … } }`

### `DELETE /admin/users/:id`

Deactivate a user. **`200`** — `message: "User deactivated successfully"`.

### `GET /admin/discussions`

All discussions for administration. → `data: { discussions }`.

### `GET /admin/reports`

All reports. → `data: { reports }`.

### `GET /admin/moderation-actions`

The moderation audit log. → `data: { actions }`.

---

## Rate limiting

The whole API is rate-limited. Defaults: development `2000` requests per
`900000` ms (15 min) window; production `300` per 15 min. Tune with
`RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX`. Exceeding the limit returns `429`
with `{ "success": false, "message": "Too many requests, please try again later" }`.

## Unmatched routes

Any unknown path under the API prefix returns `404` with
`{ "success": false, "message": "Route not found" }`.
