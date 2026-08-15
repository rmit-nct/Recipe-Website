import { useEffect, useState } from 'react';
import { getRecipes } from '../api/recipes.js';
import RecipeCard from '../features/recipes/RecipeCard.jsx';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  // useEffect tells React to run this code as soon as the page loads on the screen
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes();
        setRecipes(data);
      } catch (err) {
        // Handling the failure case!
        console.error('Failed to fetch recipes:', err);
        setError(err.message);
      }
    };

    fetchRecipes();
  }, []);

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

      {error && (
        <p className="mt-8 rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          Couldn&apos;t load recipes. Check that the server is running, then refresh.
        </p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe._id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
