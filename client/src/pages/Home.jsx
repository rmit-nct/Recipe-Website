import RecipeCard from '../features/recipes/RecipeCard.jsx';
import { fakeRecipes } from '../features/recipes/fakeRecipes.js';

export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to NEO Recipe.</p>
      <RecipeCard recipe={fakeRecipes[0]} />
    </div>
  );
}