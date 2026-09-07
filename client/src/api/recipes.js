// All fetch() calls for the recipes domain live here — components call
// these functions instead of calling fetch() directly.

/**
 * @typedef {Object} Recipe — mirrors docs/DATA_SHAPES.md
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {'food'|'bakery'} category
 * @property {string} imageUrl
 * @property {number} prepTimeMinutes
 * @property {number} servings
 * @property {Array<{name: string, quantity: string}>} ingredients
 * @property {string[]} steps
 * @property {{_id: string, username: string}} author
 * @property {number} averageRating
 * @property {number} ratingCount
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} ApiError
 * @property {string} code
 * @property {string} message
 */

async function request(path, options) {
  let response;
  try {
    response = await fetch(path, {
      credentials: 'include',
      ...options,
    });
  } catch {
    throw { code: 'NETWORK_ERROR', message: 'Could not reach the server.' };
  }

  // DELETE /api/recipes/:id returns 204 No Content — there is no body to
  // parse, and calling response.json() on an empty body throws.
  if (response.status === 204) {
    return undefined;
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw { code: 'INTERNAL_ERROR', message: 'Received an invalid response from the server.' };
  }

  if (!response.ok) {
    throw body.error ?? { code: 'INTERNAL_ERROR', message: 'Unexpected error.' };
  }

  return body.data;
}

/**
 * GET /api/recipes — session required. Query params per docs/API_CONTRACT.md:
 * ?search=&category=food|bakery&sort=top|new — all optional.
 *
 * @param {{ search?: string, category?: string, sort?: string }} [filters]
 * @returns {Promise<{ recipes: Recipe[] }>}
 */
export function getRecipes(filters = {}) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);

  const query = params.toString();
  return request(`/api/recipes${query ? `?${query}` : ''}`, { method: 'GET' });
}

/**
 * GET /api/recipes/:id — session required.
 *
 * @param {string} id
 * @returns {Promise<{ recipe: Recipe }>}
 */
export function getRecipeById(id) {
  return request(`/api/recipes/${id}`, { method: 'GET' });
}

/**
 * POST /api/recipes — session required. Multipart: recipe fields + an
 * `image` file (docs/API_CONTRACT.md). The server sets `imageUrl` from the
 * Cloudinary upload itself — it is never sent by the client here, and
 * would be ignored if it were (§ File Uploads).
 *
 * `ingredients` and `steps` are JSON-encoded into single string fields —
 * multipart form data carries flat strings only, so bracket/indexed keys
 * and repeated fields are not supported (docs/API_CONTRACT.md §
 * "Encoding array fields over multipart").
 *
 * @param {{
 *   title: string,
 *   description: string,
 *   category: 'food'|'bakery',
 *   prepTimeMinutes: number,
 *   servings: number,
 *   ingredients: Array<{name: string, quantity: string}>,
 *   steps: string[],
 *   image: File,
 * }} formValues
 * @returns {Promise<{ recipe: Recipe }>}
 */
export function createRecipe(formValues) {
  const form = new FormData();

  form.append('title', formValues.title);
  form.append('description', formValues.description);
  form.append('category', formValues.category);
  form.append('prepTimeMinutes', formValues.prepTimeMinutes);
  form.append('servings', formValues.servings);
  form.append('ingredients', JSON.stringify(formValues.ingredients));
  form.append('steps', JSON.stringify(formValues.steps));
  form.append('image', formValues.image);

  // No Content-Type header: the browser sets the multipart boundary itself
  // when the body is a FormData instance.
  return request('/api/recipes', {
    method: 'POST',
    body: form,
  });
}

/**
 * PUT /api/recipes/:id — session required, owner only. JSON (not
 * multipart): any subset of recipe fields, including `imageUrl`, with real
 * arrays/numbers rather than the multipart string encoding used on create
 * (docs/API_CONTRACT.md).
 *
 * @param {string} id
 * @param {Partial<{
 *   title: string,
 *   description: string,
 *   category: 'food'|'bakery',
 *   imageUrl: string,
 *   prepTimeMinutes: number,
 *   servings: number,
 *   ingredients: Array<{name: string, quantity: string}>,
 *   steps: string[],
 * }>} fields
 * @returns {Promise<{ recipe: Recipe }>}
 */
export function updateRecipe(id, fields) {
  return request(`/api/recipes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
}

/**
 * DELETE /api/recipes/:id — session required, owner only.
 *
 * @param {string} id
 * @returns {Promise<undefined>}
 */
export function deleteRecipe(id) {
  return request(`/api/recipes/${id}`, { method: 'DELETE' });
}
