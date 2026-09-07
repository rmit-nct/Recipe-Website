import RecipeForm from '../features/recipes/RecipeForm.jsx';

export default function CreateRecipePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
        Share a recipe
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
        Create a new recipe
      </h1>

      <div className="mt-8">
        <RecipeForm />
      </div>
    </div>
  );
}
