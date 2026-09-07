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
