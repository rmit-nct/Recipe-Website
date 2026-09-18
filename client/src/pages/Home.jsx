import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../features/recipes/RecipeCard.jsx';
import { getRecipes } from '../api/recipes.js';

const PICK_COUNT = 3;

// Fisher-Yates shuffle, then take the first N — avoids the bias of
// repeatedly picking a random index (which can return duplicates).
function pickRandom(items, count) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function Home() {
  const [picks, setPicks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPicks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { recipes } = await getRecipes();
        if (cancelled) return;
        setPicks(pickRandom(recipes, PICK_COUNT));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchPicks();

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
        <div className="mt-6">
          {isLoading ? (
            <p className="text-sm text-navy/60">Loading…</p>
          ) : error ? (
            <p className="max-w-sm rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
              Couldn&apos;t load a pick: {error.message ?? 'an unexpected error occurred.'}
            </p>
          ) : picks.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {picks.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <RecipeCard recipe={recipe} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-navy/60">No recipes yet, add the first one.</p>
          )}
        </div>
      </section>
    </div>
  );
}
