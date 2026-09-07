import { useEffect, useState } from 'react';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  { value: 'food', label: 'Food' },
  { value: 'bakery', label: 'Bakery' },
];

// 'new' and '' (no param) are the same server-side default (newest-first) —
// the select shows one "Newest" option and clears the URL param for it,
// keeping shared links minimal instead of writing a redundant ?sort=new.
const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'top', label: 'Top rated' },
];

/**
 * Search box, category filter, and sort control for the recipes list.
 * Purely presentational — filter state itself lives in the URL via
 * useRecipeFilters (client/src/features/recipes/useRecipeFilters.js).
 *
 * @param {{
 *   search: string,
 *   category: string,
 *   sort: string,
 *   onSearchSubmit: (value: string) => void,
 *   onCategoryChange: (value: string) => void,
 *   onSortChange: (value: string) => void,
 * }} props
 */
export default function RecipeFilters({
  search,
  category,
  sort,
  onSearchSubmit,
  onCategoryChange,
  onSortChange,
}) {
  // Local draft so typing doesn't rewrite the URL/refetch on every
  // keystroke — the URL updates on submit only.
  const [searchDraft, setSearchDraft] = useState(search);

  // Keep the draft in sync when the URL changes from elsewhere (back/forward
  // navigation, a pasted link, clearing filters).
  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchSubmit(searchDraft.trim());
  };

  return (
    <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
      <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes by title or ingredient
        </label>
        <input
          id="recipe-search"
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder="Search by title or ingredient…"
          className="w-full rounded-2xl border border-navy/15 bg-cream-base px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
        <button
          type="submit"
          className="shrink-0 rounded-2xl bg-navy px-4 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-navy/90"
        >
          Search
        </button>
      </form>

      <div className="flex gap-2">
        <label htmlFor="recipe-category" className="sr-only">
          Filter by category
        </label>
        <select
          id="recipe-category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-2xl border border-navy/15 bg-cream-base px-3 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="recipe-sort" className="sr-only">
          Sort recipes
        </label>
        <select
          id="recipe-sort"
          value={sort === 'top' ? 'top' : 'new'}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-2xl border border-navy/15 bg-cream-base px-3 py-2.5 font-mono text-xs uppercase tracking-[0.06em] text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
