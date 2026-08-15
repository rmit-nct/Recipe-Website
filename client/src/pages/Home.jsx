import { Link } from 'react-router-dom';
import RecipeCard from '../features/recipes/RecipeCard.jsx';
import { fakeRecipes } from '../features/recipes/fakeRecipes.js';

export default function Home() {
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
          <RecipeCard recipe={fakeRecipes[0]} />
        </div>
      </section>
    </div>
  );
}
