import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteRecipe, getRecipeById } from '../api/recipes.js';
import { AuthContext } from '../context/AuthContext.jsx';
import NeoRibbon from '../components/NeoRibbon.jsx';

export default function RecipeDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { recipe: fetchedRecipe } = await getRecipeById(id);
        if (!cancelled) setRecipe(fetchedRecipe);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchRecipe();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this recipe? This can't be undone.")) return;

    setIsDeleting(true);
    setDeleteError('');

    try {
      await deleteRecipe(id);
      navigate('/recipes');
    } catch (err) {
      setDeleteError(err.message || 'Could not delete this recipe. Please try again.');
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-navy/60">Loading recipe…</p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Couldn&apos;t load this recipe: {error.message ?? 'an unexpected error occurred.'}
        </p>
      </div>
    );
  }

  if (!recipe) return null;

  // UX convenience only — the backend's 403 ownership check (Task 1) is the
  // real enforcement. This just decides whether to render the buttons.
  const isOwner = Boolean(user) && recipe.author?._id === user._id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      {/* Smaller and capped-width than the old full-bleed hero on purpose —
          the photo is a supporting thumbnail, not the page's visual focus —
          but a bit larger than the initial cut so it doesn't read as tiny. */}
      <div className="relative h-48 w-full max-w-md overflow-hidden rounded-2xl bg-gold-light sm:h-56 md:h-64">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="h-full w-full object-cover"
            onError={(event) => event.currentTarget.remove()}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-navy">
          <NeoRibbon className="h-10 w-10 opacity-40" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1.5 font-mono text-xs uppercase tracking-[0.08em] text-navy">
          {recipe.category}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
            {recipe.title}
          </h1>
          <p className="mt-2 font-mono text-xs text-navy/60">
            By {recipe.author?.username ?? 'unknown'}
          </p>
        </div>

        {isOwner ? (
          <div className="flex items-center gap-2">
            <Link
              to={`/recipes/${recipe._id}/edit`}
              className="inline-flex items-center justify-center rounded-full border border-navy/15 bg-cream-base px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-navy transition hover:border-steel-blue"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-full bg-burnt-orange px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-burnt-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ) : null}
      </div>

      {deleteError ? (
        <p className="mt-4 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {deleteError}
        </p>
      ) : null}

      <p className="mt-6 max-w-2xl leading-relaxed text-navy/70">{recipe.description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-cream-alt px-3 py-1.5 font-mono text-[11px] text-navy">
          {recipe.prepTimeMinutes} min · serves {recipe.servings}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-light px-3 py-1.5 font-mono text-[11px] text-navy">
          <span className="h-1.5 w-1.5 rounded-full bg-burnt-orange" />
          {recipe.averageRating}
          <span className="text-navy/55">({recipe.ratingCount})</span>
        </span>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_2fr]">
        <section>
          <h2 className="font-display text-xl font-semibold text-navy">Ingredients</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li
                key={`${ingredient.name}-${index}`}
                className="flex items-baseline justify-between gap-3 border-b border-navy/10 pb-2 text-sm text-navy/80"
              >
                <span className="font-body">{ingredient.name}</span>
                <span className="font-mono text-xs text-navy/60">{ingredient.quantity}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-navy">Steps</h2>
          <ol className="mt-4 flex flex-col gap-4">
            {recipe.steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy font-mono text-[11px] text-cream-base">
                  {index + 1}
                </span>
                <p className="font-body text-sm leading-relaxed text-navy/80">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
