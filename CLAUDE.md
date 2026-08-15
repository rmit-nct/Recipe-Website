# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 1. Project One-Liner

Neo Recipe — a recipe-sharing web app where authenticated users create, browse, search, rate, and comment on recipes.

## 2. Source-of-Truth Files

- **`docs/API_CONTRACT.md`** — authoritative for every endpoint: method, path, auth requirement, request body shape, response envelope, status codes.
- **`docs/DATA_SHAPES.md`** — authoritative for every object shape (`User`, `Ingredient`, `Recipe`, `Comment`) via JSDoc `@typedef`.
- **`docs/DESIGN_SYSTEM.md`** — authoritative for every color token, typography pairing, and shape/style language, extracted from the team's "Neo Culture Tart" brand mark. If this file doesn't exist yet in the repo when you read this, stop and ask rather than styling from a guessed palette.

These three files are reconciled with each other. **Read the actual committed file before writing any code that defines, sends, styles, or expects a field name, endpoint, or color — never recall names or values from memory, training data, or "what a typical recipe app looks like."** A past draft used `name`/`text` instead of the ratified `username`/`body` because it was written from general knowledge instead of checked against the committed docs (see §11).

## 3. Mandatory Pre-Work Check

Before writing any route, controller, model, validator, component, or frontend API call that touches an endpoint, data shape, or visual style, run this checklist **in order** — every time, not just when something "seems obvious":

1. Open and read the relevant row(s) in `docs/API_CONTRACT.md` for this endpoint (method, path, auth, body, response).
2. Open and read the relevant `@typedef` in `docs/DATA_SHAPES.md` for every object involved.
3. If the work touches color, spacing, or typography, open `docs/DESIGN_SYSTEM.md` and use its named tokens — never a raw hex value or an eyeballed color.
4. Confirm, field by field, that every name you're about to write (request body key, response key, Mongoose schema field, frontend payload key, Tailwind token) is an **exact string match** to a name that literally appears in the relevant doc — not "close enough."
5. If a field, endpoint, or color you need isn't in any of the three docs: **stop**. Do not invent or guess a name or value. Ask the user or the Lead to ratify it and add it to the docs first.

## 4. Repo Structure Map

**Backend request flow:** `server/src/routes/` → `middleware/` (e.g. `requireAuth`) → `validators/` (zod schemas) → `controllers/` → `models/` (Mongoose). `server/src/app.js` mounts routes and middleware; `server/src/index.js` boots the server; config lives in `server/src/config/`.

**Frontend flow:** `client/src/api/` (fetch wrappers per resource) → `client/src/features/<domain>/` (`auth`, `recipes`, `comments` — feature-scoped logic/components) → `client/src/components/` (shared UI) → `client/src/pages/` (route-level composition) → wired into `client/src/App.jsx`. Cross-cutting state in `client/src/context/`; reusable logic in `client/src/hooks/`.

**Common commands:** client (`cd client`) — `npm run dev`, `npm run build`, `npm run lint` (oxlint). Server (`cd server`) — `npm run dev` (nodemon), `npm start`. No test runner is configured in either package yet.

## 5. File Ownership / High-Traffic Files

Announce before editing — 4 humans + Claude Code can collide on these:

| File | Why it's high-traffic |
|---|---|
| `client/src/App.jsx` | Central route/provider wiring for the whole frontend |
| `server/src/app.js` (and any future `server/src/routes/index.js` aggregator) | Mounts every route and top-level middleware |
| `client/package.json`, `server/package.json` | Shared dependency/script surface — avoid drive-by version bumps |
| `client/tailwind.config.js` (or the `@theme` block in the main CSS file) | Defines every design token; a stray edit here silently changes color/type across the whole app |

## 6. Workflow Per Feature

Build in this order; each step depends on the previous one:

1. Check `docs/API_CONTRACT.md`, `docs/DATA_SHAPES.md`, and (if styling is involved) `docs/DESIGN_SYSTEM.md` for this feature (§3).
2. Backend: model (`server/src/models`) → route (`server/src/routes`) → middleware (`server/src/middleware`) → validator (`server/src/validators`) → controller (`server/src/controllers`).
3. Self-test the endpoint via `docs/requests.http` — only once this passes, move on.
4. Frontend: `client/src/api/` call → feature module (`client/src/features/<domain>`) → component → page wiring (`client/src/pages/`, `client/src/App.jsx`).

## 7. Non-Negotiable Rules

- Plain JavaScript only — no TypeScript files, no `.ts`/`.tsx`, no TS build config, anywhere in `client/` or `server/`.
- No Postman — API testing happens via `docs/requests.http` (`.http` requests); keep it current.
- No `fetch()` calls outside `client/src/api/` — components and feature modules call the wrapper functions there, never the network directly.
- No hardcoded hex codes for brand colors — use the Tailwind tokens defined from `docs/DESIGN_SYSTEM.md` (e.g. `bg-cream-base`, `text-navy`), so a palette change is a one-file edit, not a find-and-replace across the app.
- Never trust `req.body` for identity — only `req.user.id` (set by `requireAuth` from the JWT) identifies the caller.
- Every owner-scoped `PUT`/`DELETE` must check resource ownership in the controller after `requireAuth` runs — `requireAuth` passing proves identity, not ownership (see §9).
- Any endpoint change updates `docs/API_CONTRACT.md` and `docs/requests.http` in the same PR; any shape change also updates `docs/DATA_SHAPES.md`; any new color/type decision also updates `docs/DESIGN_SYSTEM.md`.
- Never commit `.env` — only `.env.example` (client and server each have one).

## 8. Frontend Implementation Standards

**Components**
- Functional components with hooks only — no class components.
- `useContext` is reserved for auth state (`AuthContext`) only. Don't reach for Context for anything else; component props and local state are the default.
- URL is state: filters, search terms, and sort order belong in the router's query string (`useSearchParams`), not component-local-only state that resets on refresh.

**Data fetching**
- Every `fetch()` call lives in `client/src/api/<resource>.js` and is imported by feature modules — never called directly from a component (§7).
- Every fetch is wrapped in `try/catch`. A rejected promise nothing catches is a silent bug, not an edge case.
- Unwrap the response envelope exactly as `docs/API_CONTRACT.md` defines it (`{ data: ... }` / `{ error: { code, message } }`) — never assume a bare payload.
- Full loading/empty/error UI states are required by the Sprint 3 Definition of Done. Earlier walking-skeleton work (Sprint 1–2) may use a minimal `console.error` on failure instead — don't build the full states early just because this rule exists; don't skip them once Sprint 3 lands either.

**Data shapes**
- Since there's no compiler, add a JSDoc `@typedef`-style comment (matching `docs/DATA_SHAPES.md`) wherever a component or hook expects a `Recipe`, `User`, or `Comment` shape, so editors surface autocomplete and mismatches are visible at a glance.

**Styling**
- Tailwind utility classes only — no separate CSS Modules or hand-written stylesheets unless a genuine gap in Tailwind's utilities forces it.
- Mobile-first ordering: unprefixed classes are the small-screen baseline, `md:`/`lg:` layer on top for larger viewports — never the reverse.
- Every color, and any typeface beyond the pairing documented in `docs/DESIGN_SYSTEM.md`, comes from that file's tokens — no eyeballed or "close enough" values.
- Responsive check at 375px, 768px, and 1280px before marking a UI task done (Definition of Done, handbook §9.1).

**Hygiene**
- No `console.log` left in.

## 9. Backend Implementation Standards

**Layering** — never let these blur (handbook §5.2):
| Layer | Job | Must NOT do |
|---|---|---|
| Route | Map URL → handler | Contain logic |
| Middleware | Cross-cutting: auth, logging, errors | Know about recipes specifically |
| Validator (Zod) | Parse and reject malformed input before it reaches business logic | Contain business rules |
| Controller | Business rules, authorization | Know about HTTP status codes *deeply* — keep it thin |
| Model (Mongoose) | Schema, persistence | Know about HTTP at all |

The test: if you swapped Express for Fastify, only the route/middleware layer should change.

**Response contract**
- Every response uses the shared envelope from `docs/API_CONTRACT.md`: `{ data: {...} }` on success, `{ error: { code, message } }` on failure. No ad hoc shapes.
- Use the status code table in `docs/API_CONTRACT.md` §8.1. In particular: **401 means "who are you?"** (not authenticated — frontend should redirect to login); **403 means "I know who you are, and no"** (authenticated, not the owner — frontend should show a message). Never conflate the two.
- Where an endpoint's semantics are naturally "replace this value" (e.g. a user's rating on a recipe), use `PUT`, not `POST` — idempotency is the correct signal here, matching the existing `/api/recipes/:id/rating` pattern.

**Identity & ownership**
- Identity comes from `req.user.id` (set by `requireAuth` after verifying the JWT) — never from `req.body`, which is a value the browser controls and can lie about.
- Every owner-scoped `PUT`/`DELETE` explicitly re-checks `resource.author.toString() === req.user.id` in the controller, even though `requireAuth` already ran. `requireAuth` proves *someone* is logged in; it says nothing about *whose* resource this is.

**Validation & data**
- Validate with Zod at the validator layer, before the controller runs — parse, don't validate: the controller should receive an already-clean object, not raw `req.body`.
- Mongoose schema fields match `docs/DATA_SHAPES.md`'s `@typedef`s field-for-field. If a field doesn't appear in that doc, it doesn't go in the schema until the doc is updated first (§3).
- Denormalized fields (currently `averageRating`, `ratingCount` on `Recipe`) are updated on write, not recomputed on every read — this is a deliberate reads-cheap/writes-slightly-harder trade-off (handbook §5.3); don't "simplify" it back to a live aggregation without flagging the trade-off to the Lead first.
- Don't chain `.populate()` more than one or two levels deep — each level is a second database query, not a free JOIN.

**Auth specifics**
- Passwords: `bcrypt`, cost ≥ 10. Never store, log, or return a plaintext password or a `passwordHash` in any API response.
- JWT lives in an httpOnly cookie, never `localStorage` (XSS exposure). A JWT is signed, not encrypted — never put a secret or sensitive data in the payload.
- Async route handlers: Express 5 auto-forwards thrown errors to the error middleware. Don't add `express-async-handler` wrappers — that's a v4-era pattern this codebase doesn't need.

**Hygiene**
- No `console.log` left in.

## 10. Session Behavior Expectations

- Before writing code that touches an endpoint, data shape, or visual style, state which `docs/` file(s) you checked and what you found (e.g. "Checked API_CONTRACT.md: `POST /api/recipes/:id/comments` body is `{ body }`"; "Checked DESIGN_SYSTEM.md: using `navy` for headings, `gold` for the primary CTA").
- If asked to add or change a field, endpoint, or color/type decision, update the relevant `docs/` file in the same change — never leave the docs to drift from the code.
- If a requested field, endpoint, or style value isn't ratified in the docs, stop and ask rather than inventing it.

## 11. Update Log

| Date | Change | Why |
|---|---|---|
| 2026-08-01 | Created this file; added mandatory contract/shape cross-check (§3) | An earlier draft of `API_CONTRACT.md` used `name`/`text` instead of the ratified `username`/`body` (per `DATA_SHAPES.md`) because it was drafted from general knowledge instead of checked against the committed doc. This file exists to make that re-verification mandatory, not optional. |
| 2026-08-15 | Added `docs/DESIGN_SYSTEM.md` as a third source-of-truth file; added Frontend Implementation Standards (§8) and Backend Implementation Standards (§9) | Sprint 1 surfaced coding conventions the team was already following informally (fetch-only-in-`api/`, Context-for-auth-only, layered responsibility, envelope/status-code discipline, no hardcoded colors) — codifying them here so they're enforced consistently as more people touch the codebase, instead of relying on each PR reviewer to remember and re-explain them. |