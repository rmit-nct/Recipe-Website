import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecipes } from '../api/recipes.js';
import RecipeCard from '../features/recipes/RecipeCard.jsx';
import RecipeFilters from '../features/recipes/RecipeFilters.jsx';
import { useRecipeFilters } from '../features/recipes/useRecipeFilters.js';

export default function Recipes() {
  const { search, category, sort, setFilters } = useRecipeFilters();

  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-fetches whenever the URL-derived filters change — including on first
  // render, so a pasted link with ?category=bakery already in it shows the
  // filtered list immediately instead of the unfiltered list flashing first.
  useEffect(() => {
    let cancelled = false;

    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { recipes: fetchedRecipes } = await getRecipes({ search, category, sort });
        if (!cancelled) setRecipes(fetchedRecipes);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRecipes();

    return () => {
      cancelled = true;
    };
  }, [search, category, sort]);

  const hasActiveFilters = Boolean(search || category);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
        Fresh from the kitchen
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
        Recipes worth cooking tonight
      </h1>
      <p className="mt-3 max-w-xl leading-relaxed text-navy/70">
        A few fast, friendly dishes to get you started.
      </p>

      <RecipeFilters
        search={search}
        category={category}
        sort={sort}
        onSearchSubmit={(value) => setFilters({ search: value })}
        onCategoryChange={(value) => setFilters({ category: value })}
        onSortChange={(value) => setFilters({ sort: value === 'new' ? '' : value })}
      />

      {error?.code === 'UNAUTHENTICATED' ? (
        <p className="mt-8 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Your session has expired.{' '}
          <Link to="/login" className="font-semibold text-steel-blue underline">
            Log in again
          </Link>{' '}
          to keep browsing recipes.
        </p>
      ) : error ? (
        <p className="mt-8 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Couldn&apos;t load recipes: {error.message ?? 'an unexpected error occurred.'}
        </p>
      ) : null}

      {isLoading ? (
        <p className="mt-10 text-sm text-navy/60">Loading recipes…</p>
      ) : error ? null : recipes.length === 0 ? (
        <p className="mt-10 text-sm text-navy/60">
          {hasActiveFilters
            ? 'No recipes match those filters. Try a different search or category.'
            : 'No recipes yet.'}
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe._id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
