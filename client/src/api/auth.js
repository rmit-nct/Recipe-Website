// All fetch() calls for the auth domain live here — components and
// AuthContext call these functions instead of calling fetch() directly.

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {string} email
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
      headers: { 'Content-Type': 'application/json' },
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
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<{ user: User }>}
 */
export function register(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<{ user: User }>}
 */
export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * @returns {Promise<{ ok: boolean }>}
 */
export function logout() {
  return request('/api/auth/logout', { method: 'POST' });
}

/**
 * @returns {Promise<{ user: User }>}
 */
export function me() {
  return request('/api/auth/me', { method: 'GET' });
}
