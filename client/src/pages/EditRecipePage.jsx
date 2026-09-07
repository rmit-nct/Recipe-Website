import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRecipeById } from '../api/recipes.js';
import { AuthContext } from '../context/AuthContext.jsx';
import RecipeForm from '../features/recipes/RecipeForm.jsx';

export default function EditRecipePage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (isLoading) {
    return (
      <p className="mx-auto max-w-3xl px-4 py-10 text-sm text-navy/60">Loading recipe…</p>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Couldn&apos;t load this recipe: {error.message ?? 'an unexpected error occurred.'}
        </p>
      </div>
    );
  }

  if (!recipe) return null;

  // Client-side check for UX only — a fast "not yours" message instead of a
  // round trip that ends in the backend's 403. The backend's ownership
  // check (already built) is the real enforcement, not this.
  const isOwner = Boolean(user) && recipe.author?._id === user._id;

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          This isn&apos;t your recipe, so you can&apos;t edit it.{' '}
          <Link to={`/recipes/${id}`} className="font-semibold text-steel-blue underline">
            Back to the recipe
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
        Edit recipe
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
        {recipe.title}
      </h1>

      <div className="mt-8">
        <RecipeForm recipe={recipe} />
      </div>
    </div>
  );
}
