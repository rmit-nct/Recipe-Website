import { useCallback, useState } from 'react';
import { uploadImage } from '../../api/uploads.js';
import { createRecipe, updateRecipe } from '../../api/recipes.js';

/**
 * Orchestrates the create/edit submit flow for the recipe form. This does
 * not build or render any UI — Task 3 (Frontend Feature Dev) owns the form
 * itself; this hook is only the piece that turns form values into the
 * right API calls.
 *
 * Create: POST /api/recipes takes the image `File` directly over
 * multipart — there is no separate /api/uploads call, and any `imageUrl`
 * sent by the client would be ignored anyway (docs/API_CONTRACT.md §
 * File Uploads).
 *
 * Update: PUT /api/recipes/:id is JSON and needs a URL string, not a file,
 * so a new image goes through POST /api/uploads first. If `formValues.image`
 * isn't a File (no new image was picked), the upload step is skipped
 * entirely and `imageUrl` is simply omitted from the PUT body — the
 * server leaves the recipe's existing image untouched.
 */
export function useRecipeSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (formValues, { mode, id } = {}) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'create') {
        return await createRecipe(formValues);
      }

      if (mode === 'update') {
        const { image, ...rest } = formValues;
        const payload = { ...rest };

        if (image instanceof File) {
          payload.imageUrl = await uploadImage(image);
        }

        return await updateRecipe(id, payload);
      }

      throw { code: 'VALIDATION_ERROR', message: `Unknown submit mode: ${mode}` };
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { submit, isSubmitting, error };
}
