# Neo Recipe

A recipe-sharing web app where authenticated users can create, browse, search, rate, and comment on recipes. Guests only see the public landing page — every other read or write requires a signed-in session. Built as a full-stack monorepo: a React SPA talking to an Express + MongoDB API over a JWT httpOnly-cookie session, with recipe images stored on Cloudinary.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS v4, oxlint |
| Backend | Express 5, Mongoose 9 (MongoDB), Zod (validation) |
| Auth | JWT in an httpOnly cookie, bcryptjs for password hashing |
| File uploads | Multer (multipart parsing) → Cloudinary (image storage) |

See [`client/package.json`](client/package.json) and [`server/package.json`](server/package.json) for exact dependency versions.

## Prerequisites

- A recent Node.js LTS version and npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any reachable MongoDB instance) and its connection string
- A [Cloudinary](https://cloudinary.com/) account (cloud name, API key, API secret) for recipe image uploads


## Demo Video
https://github.com/user-attachments/assets/eb8f8e8d-d0f9-4a67-a965-7fb43fe3aa28
*Full recipe lifecycle: create with an uploaded image → view detail → edit → delete, all enforced server-side by ownership checks.*

## Setup

### 1. Clone and enter the repo

```bash
git clone <repo-url>
cd Recipe-Website
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env` (see [`server/.env.example`](server/.env.example) for the exact variable names):

| Variable | Notes |
|---|---|
| `PORT` | Port the API listens on |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Required — the server refuses to start if this is missing or empty. Use a long random string. |
| `CLIENT_ORIGIN` | URL of the running frontend, for CORS (`http://localhost:5173` in dev) |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |

Run the server:

```bash
npm run dev    # nodemon, auto-restarts on change
# or
npm start      # plain node
```

### 3. Client

```bash
cd client
npm install
cp .env.example .env
```

`client/.env.example` currently declares no variables — the client has no required env config yet.

Run the client:

```bash
npm run dev       # Vite dev server, http://localhost:5173
npm run build     # production build
npm run preview   # preview a production build locally
npm run lint      # oxlint
```

With both processes running, the client dev server talks to the API at the origin configured in the client's fetch wrappers (`client/src/api/`), and the server allows that origin via `CLIENT_ORIGIN`.

## Testing the API

There is no automated test runner configured in either package yet. To exercise the API directly, use [`docs/requests.http`](docs/requests.http) — a set of `.http` requests you can run with an editor's REST client extension (e.g. the VS Code "REST Client" extension) against your locally running server. This is the project's standard for manual API testing; no Postman collection is maintained.

## API & Data Reference

- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — every endpoint: method, path, auth requirement, request body, response envelope, and status codes.
- [`docs/DATA_SHAPES.md`](docs/DATA_SHAPES.md) — the `User`, `Ingredient`, `Recipe`, and `Comment` object shapes.
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — color tokens, typography, and shape language.

All responses use a shared envelope: `{ data: ... }` on success, `{ error: { code, message } }` on failure.

## Features

**Must-have (built and verified):**

- Register / login with role-gated access — guests see only the landing page; every recipe, comment, and rating route requires an authenticated session
- Recipe CRUD with image upload (Cloudinary), restricted to the recipe's owner for edit/delete
- Comments on recipes
- 1–5 star ratings, with a "Top Rated" feed
- Backend-driven search, filter, and sort on the recipe list
- Responsive layout, checked at 375px / 768px / 1280px

Not in scope for this project: following users, notifications, DMs, meal planner, shopping list, admin dashboard, social login, and i18n.

## Team Contributions

| Name | GitHub Handle | Role |
|---|---|---|
| Gia Khanh | kh3oz | Lead / Integrator |
| Khoa Minh | Articial-space | Backend Dev |
| Minh Triet| minhtriet| Core Dev |
| Gia Phuc | Nguyengiaphuc | Frontend Feature Dev |


