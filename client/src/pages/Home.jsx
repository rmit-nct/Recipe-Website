import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../features/recipes/RecipeCard.jsx';
import { getRecipes } from '../api/recipes.js';

export default function Home() {
  const [pick, setPick] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPick = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { recipes } = await getRecipes();
        if (cancelled) return;
        const random = recipes.length
          ? recipes[Math.floor(Math.random() * recipes.length)]
          : null;
        setPick(random);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPick();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      {/* Checkerboard hero — the logo's own cream tile pattern, kept behind
          display type only (never body copy), per DESIGN_SYSTEM.md. */}
      <section className="border-b border-navy/10 bg-cream-base bg-[repeating-conic-gradient(var(--color-cream-alt)_0%_25%,var(--color-cream-base)_0%_50%)] bg-size-[56px_56px]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
            Neo Culture Tart
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.1] text-navy md:text-6xl">
            Good food, shared warm.
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-navy/70">
            Browse what the community is cooking, then add the one dish you make
            better than anyone.
          </p>
          <Link
            to="/recipes"
            className="mt-8 inline-flex items-center rounded-full bg-navy px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-navy/90"
          >
            Browse recipes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="font-display text-2xl font-semibold text-navy md:text-3xl">
          Tonight&apos;s pick
        </h2>
        <div className="mt-6 max-w-sm">
          {isLoading ? (
            <p className="text-sm text-navy/60">Loading…</p>
          ) : error ? (
            <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
              Couldn&apos;t load a pick: {error.message ?? 'an unexpected error occurred.'}
            </p>
          ) : pick ? (
            <Link
              to={`/recipes/${pick._id}`}
              className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RecipeCard recipe={pick} />
            </Link>
          ) : (
            <p className="text-sm text-navy/60">No recipes yet — add the first one.</p>
          )}
        </div>
      </section>
    </div>
  );
}
