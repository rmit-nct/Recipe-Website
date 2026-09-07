# Neo Recipe API Contract

Status: Draft v0 — pending team ratification at kickoff

## Response Envelope Convention

Every response body is wrapped, success or error. There is no bare/unwrapped JSON.

Success:

```jsonc
{ "data": { /* ... */ } }
```

Error:

```jsonc
{ "error": { "code": "VALIDATION_ERROR", "message": "Title is required" } }
```

`code` is a stable machine-readable string (`VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`, `INTERNAL_ERROR`, ...); `message` is human-readable and safe to show in the UI.

## Status Codes

| Code | Meaning | When |
|---|---|---|
| 200 | OK | Successful `GET` or `PUT` that returns a body |
| 201 | Created | Successful `POST` that creates a resource |
| 204 | No Content | Successful `DELETE` — no response body |
| 400 | Bad Request | Request fails validation (zod schema) |
| 401 | Unauthorized | No valid session — the request is not authenticated |
| 403 | Forbidden | Session is valid, but the user does not own the resource |
| 404 | Not Found | Resource does not exist (or does not exist for this user) |
| 409 | Conflict | Resource already exists (e.g. email already registered) |
| 500 | Internal Server Error | Unhandled server error |

> **401 vs 403 is intentional, not interchangeable.** 401 means "we don't know who you are" — the client redirects to login. 403 means "we know who you are, and you're not allowed to do this" — the client shows an inline message, no redirect. Controllers must not collapse these into a single "unauthorized" response.

## Role Gate

Guests get the public landing page and nothing else. Every `GET` or mutation under `/api/recipes`, `/api/recipes/:id/comments`, `/api/comments`, and `/api/recipes/:id/rating` requires a valid authenticated session (JWT in an httpOnly cookie, checked by `requireAuth` middleware). There is no anonymous read path for recipes, comments, or ratings — this is stricter than a typical recipe app, and it is intentional, not an oversight.

## Endpoints

| Method | Path | Auth | Body | Returns |
|---|---|---|---|---|
| POST | `/api/auth/register` | Public | `{ username, email, password }` | `{ data: { user } }` — sets session cookie |
| POST | `/api/auth/login` | Public | `{ email, password }` | `{ data: { user } }` — sets session cookie |
| POST | `/api/auth/logout` | Session | — | `{ data: { ok: true } }` — clears session cookie |
| GET | `/api/auth/me` | Session | — | `{ data: { user } }` |
| GET | `/api/recipes` | Session | Query: `?search=&category=&sort=top\|new` | `{ data: { recipes: [...] } }` |
| GET | `/api/recipes/:id` | Session | — | `{ data: { recipe } }` |
| POST | `/api/recipes` | Session | multipart: recipe fields + `image` file — see § File Uploads | `{ data: { recipe } }` |
| POST | `/api/uploads` | Session | multipart: a single `image` file | `{ data: { url } }` — 201 |
| PUT | `/api/recipes/:id` | Session, owner only | JSON (not multipart): any subset of recipe fields, incl. `imageUrl` | `{ data: { recipe } }` |
| DELETE | `/api/recipes/:id` | Session, owner only | — | `204 No Content` |
| GET | `/api/recipes/:id/comments` | Session | — | `{ data: { comments: [...] } }` |
| POST | `/api/recipes/:id/comments` | Session | `{ body }` | `{ data: { comment } }` |
| DELETE | `/api/comments/:id` | Session, owner only | — | `204 No Content` |
| PUT | `/api/recipes/:id/rating` | Session | `{ value: 1..5 }` | `{ data: { rating } }` — this user's rating; resubmitting replaces it (idempotent, not additive) |

## Ownership Checks

`requireAuth` proves identity, not ownership. It only confirms the request carries a valid session — it says nothing about whether that user is allowed to touch the specific resource being edited or deleted. Every `PUT`/`DELETE` on a resource with an owner must separately check ownership in the controller, after `requireAuth` has run:

```js
if (recipe.author.toString() !== req.user.id) {
  return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not the owner' } });
}
```

Missing this check is a security bug, not a style nit — `requireAuth` passing is not sufficient justification to proceed with a mutation on someone else's resource.

## File Uploads

Storage is Cloudinary (handbook D6) — nothing is written to local disk, because free-tier
deploys have ephemeral filesystems and a saved file would not survive a restart. Server
credentials come from `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`.

**The multipart file field is named `image`** on both `POST /api/uploads` and
`POST /api/recipes`. Limits: images only (`image/*`), 5 MB maximum. A rejected upload
returns `400 VALIDATION_ERROR` in the standard envelope — never a bare Express error page.

`POST /api/recipes` takes the image file **directly**; it does not expect an `imageUrl`
produced by a prior `/api/uploads` call. The two are independent entry points, not a
two-step flow. On create, `imageUrl` is set by the server from the Cloudinary response and
is **ignored if sent by the client**. `PUT /api/recipes/:id` is JSON and does accept an
`imageUrl` string, so replacing an image is: `POST /api/uploads` → `PUT` the returned URL.

### Encoding array fields over multipart

Multipart form data carries flat strings only, so the two array fields on `Recipe` are sent
as **JSON strings in a single field each**:

```js
form.append('ingredients', JSON.stringify([{ name: 'Garlic', quantity: '4 cloves' }]));
form.append('steps', JSON.stringify(['Boil the pasta.', 'Fry the garlic.']));
```

Repeated fields (`steps=a&steps=b`) and bracket-indexed keys (`ingredients[0][name]`) are
**not** supported — bracket parsing is not consistent across body parsers. Both arrays must
be non-empty. Numeric fields (`prepTimeMinutes`, `servings`) arrive as strings and are
coerced server-side; over `PUT` (JSON) they must be real numbers.

`author`, `averageRating`, and `ratingCount` are never accepted from the client on either
create or update. `author` is set from the session; the two rating fields are maintained by
`PUT /api/recipes/:id/rating`.

## Pagination

Dropped from this contract per current scope — no `page`/`limit`/`pages` fields appear in any response above. If added later, reintroduce `?page=&limit=` on `GET /api/recipes` and `{ items, total, page, pages }` on its response — additive, no other endpoint changes needed.

## Change Process

Changes to this file require the Lead's sign-off and must be reflected in `docs/requests.http` in the same PR.
