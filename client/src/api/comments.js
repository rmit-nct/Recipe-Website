// All fetch() calls for the comments domain live here — components and
// feature modules call these functions instead of calling fetch() directly.

/**
 * @typedef {Object} Comment — mirrors docs/DATA_SHAPES.md
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {string} body
 * @property {string} createdAt
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

  // DELETE /api/comments/:id returns 204 No Content — there is no body to
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
 * GET /api/recipes/:id/comments — session required.
 *
 * @param {string} recipeId
 * @returns {Promise<{ comments: Comment[] }>}
 */
export function getComments(recipeId) {
  return request(`/api/recipes/${recipeId}/comments`, { method: 'GET' });
}

/**
 * POST /api/recipes/:id/comments — session required. Body is `{ body }`
 * (docs/API_CONTRACT.md) — the ratified field name is `body`, not `text`.
 *
 * @param {string} recipeId
 * @param {string} body
 * @returns {Promise<{ comment: Comment }>}
 */
export function createComment(recipeId, body) {
  return request(`/api/recipes/${recipeId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

/**
 * DELETE /api/comments/:id — session required, owner only.
 *
 * @param {string} commentId
 * @returns {Promise<undefined>}
 */
export function deleteComment(commentId) {
  return request(`/api/comments/${commentId}`, { method: 'DELETE' });
}
