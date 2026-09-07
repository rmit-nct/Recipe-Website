import { useSearchParams } from 'react-router-dom';

/**
 * Reads/writes recipe search, category, and sort filters from the URL query
 * string — the router's `useSearchParams`, not component-local state — so
 * filters survive a refresh and a filtered link can be shared/pasted.
 *
 * Param names (`search`, `category`, `sort`) match docs/API_CONTRACT.md's
 * GET /api/recipes query exactly, so callers can pass this hook's values
 * straight to the recipes API with no translation.
 */
export function useRecipeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';

  /**
   * Merges the given updates into the URL query string. Passing an empty
   * string (or omitting a key) removes that param rather than writing an
   * empty `?search=` — keeps shared links minimal.
   * @param {{ search?: string, category?: string, sort?: string }} updates
   */
  const setFilters = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      }

      return next;
    });
  };

  return { search, category, sort, setFilters };
}
