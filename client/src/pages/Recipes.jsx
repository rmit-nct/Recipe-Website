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
    <div>
      <h1>Recipes Page</h1>
      {error && <p>Fetch failed. Is the backend running? ({error})</p>}
      {recipes.map((recipe) => (
        <RecipeCard key={recipe._id} recipe={recipe} />
      ))}
    </div>
  );
}