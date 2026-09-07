# Neo Recipe Data Shapes

Status: v0 — companion to `docs/API_CONTRACT.md`, not compiler-enforced

There is no TypeScript in this project. These shapes are documented by convention and enforced by code review and the `.http` request file, not by a compiler. The JSDoc `@typedef` comments in the actual model files (`server/src/models/*.js`) should mirror the shapes below — that gives editors (VS Code) autocomplete without a build step.

### User

```js
/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
 * @property {string} createdAt
 * // NEVER include passwordHash in any response
 */
```

### Ingredient

```js
/**
 * @typedef {Object} Ingredient
 * @property {string} name
 * @property {string} quantity  // "200 g" — string, not number. Units are messy; don't over-model.
 */
```

> `quantity` is a string, not a number, because units are messy — "200 g" — and modeling amount/unit separately isn't worth the complexity it adds.

### Recipe

```js
/**
 * @typedef {Object} Recipe
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {'food'|'bakery'} category
 * @property {string} imageUrl
 * @property {number} prepTimeMinutes
 * @property {number} servings
 * @property {Ingredient[]} ingredients
 * @property {string[]} steps
 * @property {{_id: string, username: string}} author
 * @property {number} averageRating
 * @property {number} ratingCount
 * @property {string} createdAt
 * @property {string} updatedAt
 */
```

> `averageRating` is denormalized onto `Recipe` rather than computed on every read. Reads outnumber writes roughly 100:1, so storing it trades slightly harder writes (recompute on rating change) for much cheaper reads (no aggregation on every list/detail request).

### Comment

```js
/**
 * @typedef {Object} Comment
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {string} body
 * @property {string} createdAt
 */
```

### Rating

```js
/**
 * @typedef {Object} Rating
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {number} value       // integer 1..5
 * @property {string} createdAt
 * @property {string} updatedAt
 */
```

> A `Rating` is unique per `(recipeId, author)` pair, enforced by a unique index on the
> model — not just by a controller check. `PUT /api/recipes/:id/rating` replaces the
> existing row for that pair rather than appending, which is why the endpoint is a `PUT`
> and not a `POST`.
>
> `author` mirrors `Comment.author` rather than introducing a separate `userId` field, so
> "the user who made this" is named the same way across every shape in this doc.
>
> `updatedAt` is present here but not on `Comment`: a rating's whole semantic is
> replacement, so when it last changed is meaningful. Comments are not editable in this
> scope.
>
> Writing a `Rating` recomputes and persists `averageRating` and `ratingCount` on the
> parent `Recipe` in the same request. Those two fields are the denormalized read path;
> this collection is the source of truth they are derived from.

## Change Process

Changes to any shape require updating this doc in the same PR as the code change.
