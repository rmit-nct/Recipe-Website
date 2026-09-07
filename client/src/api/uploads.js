// All fetch() calls for the uploads domain live here — components and
// feature modules call this function instead of calling fetch() directly.

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
 * POST /api/uploads — session required. Multipart: a single `image` file.
 * The field name is `image` on both POST /api/uploads and POST /api/recipes
 * (docs/API_CONTRACT.md § File Uploads).
 *
 * No explicit Content-Type header is set: the browser fills in the
 * multipart boundary itself when the body is a FormData instance.
 *
 * @param {File} file
 * @returns {Promise<string>} the uploaded image's URL
 */
export async function uploadImage(file) {
  const form = new FormData();
  form.append('image', file);

  const { url } = await request('/api/uploads', {
    method: 'POST',
    body: form,
  });

  return url;
}
