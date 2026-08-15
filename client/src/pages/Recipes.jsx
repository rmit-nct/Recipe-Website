import { useEffect, useState } from 'react';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);

  // useEffect tells React to run this code as soon as the page loads on the screen
  useEffect(() => {
    const fetchFakeRecipes = async () => {
      try {
        // The Vite proxy will catch this and forward it to the backend
        const response = await fetch('/api/recipes');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { data } = await response.json();
        setRecipes(data.recipes);
      } catch (err) {
        // Handling the failure case!
        setError(err.message);
      }
    };

    fetchFakeRecipes();
  }, []);

  return (
    <div>
      <h1>Recipes Page</h1>
      {error && <p>Fetch failed. Is the backend running? ({error})</p>}
      <ul>
        {recipes.map((recipe) => (
          <li key={recipe._id}>{recipe.title}</li>
        ))}
      </ul>
    </div>
  );
}