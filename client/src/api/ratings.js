// All fetch() calls for the ratings domain live here — components and
// feature modules call this function instead of calling fetch() directly.

/**
 * @typedef {Object} Rating — mirrors docs/DATA_SHAPES.md
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {number} value
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
 * PUT /api/recipes/:id/rating — session required. Body is `{ value: 1..5 }`.
 * Idempotent, not additive: resubmitting replaces this user's existing
 * rating rather than adding a new one (docs/API_CONTRACT.md).
 *
 * @param {string} recipeId
 * @param {number} value
 * @returns {Promise<{ rating: Rating }>}
 */
export function putRating(recipeId, value) {
  return request(`/api/recipes/${recipeId}/rating`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  });
}
