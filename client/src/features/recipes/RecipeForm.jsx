import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipeSubmit } from './useRecipeSubmit.js';

const CATEGORIES = ['food', 'bakery'];

const inputClass =
  'rounded-xl border border-navy/15 bg-cream-base px-4 py-2.5 text-navy placeholder:text-navy/40 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue/30';
const labelClass = 'font-mono text-xs uppercase tracking-[0.08em] text-navy/70';
const fieldErrorClass = 'text-sm text-burnt-orange';

/**
 * @typedef {Object} Ingredient
 * @property {string} name
 * @property {string} quantity
 */

/**
 * Create/edit form for a recipe. In create mode it calls createRecipe (via
 * useRecipeSubmit) with an image File attached — the backend requires the
 * file directly on POST /api/recipes (docs/API_CONTRACT.md § File Uploads).
 * In edit mode it calls updateRecipe; a new image is only uploaded (and
 * imageUrl only sent) if the user actually picks a new file — otherwise the
 * existing image is left untouched, handled inside useRecipeSubmit.
 *
 * @param {{ recipe?: import('../../api/recipes.js').Recipe }} props
 */
export default function RecipeForm({ recipe }) {
  const isEditing = Boolean(recipe);
  const navigate = useNavigate();
  const { submit, isSubmitting } = useRecipeSubmit();

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [category, setCategory] = useState(recipe?.category ?? CATEGORIES[0]);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    recipe?.prepTimeMinutes !== undefined ? String(recipe.prepTimeMinutes) : '',
  );
  const [servings, setServings] = useState(
    recipe?.servings !== undefined ? String(recipe.servings) : '',
  );
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(recipe?.imageUrl ?? '');

  /** @type {[Ingredient[], Function]} */
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients?.length ? recipe.ingredients : [{ name: '', quantity: '' }],
  );
  const [steps, setSteps] = useState(recipe?.steps?.length ? recipe.steps : ['']);

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function updateIngredient(index, field, value) {
    setIngredients((prev) =>
      prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient)),
    );
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: '', quantity: '' }]);
  }

  function removeIngredient(index) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateStep(index, value) {
    setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
  }

  function addStep() {
    setSteps((prev) => [...prev, '']);
  }

  function removeStep(index) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  function validate() {
    const errors = {};

    if (!title.trim()) errors.title = 'Title is required.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!category) errors.category = 'Category is required.';

    if (prepTimeMinutes === '') {
      errors.prepTimeMinutes = 'Prep time is required.';
    } else if (Number.isNaN(Number(prepTimeMinutes)) || Number(prepTimeMinutes) < 0) {
      errors.prepTimeMinutes = 'Prep time must be 0 or more minutes.';
    }

    if (servings === '') {
      errors.servings = 'Servings is required.';
    } else if (Number.isNaN(Number(servings)) || Number(servings) < 1) {
      errors.servings = 'Servings must be at least 1.';
    }

    if (!isEditing && !image) {
      errors.image = 'An image is required.';
    }

    const incompleteIngredient = ingredients.some(
      (ingredient) =>
        (ingredient.name.trim() && !ingredient.quantity.trim()) ||
        (!ingredient.name.trim() && ingredient.quantity.trim()),
    );
    const completeIngredients = ingredients.filter(
      (ingredient) => ingredient.name.trim() && ingredient.quantity.trim(),
    );
    if (incompleteIngredient) {
      errors.ingredients = 'Each ingredient needs both a name and a quantity.';
    } else if (completeIngredients.length === 0) {
      errors.ingredients = 'Add at least one ingredient.';
    }

    const completeSteps = steps.filter((step) => step.trim());
    if (completeSteps.length === 0) {
      errors.steps = 'Add at least one step.';
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const cleanIngredients = ingredients
      .filter((ingredient) => ingredient.name.trim() && ingredient.quantity.trim())
      .map((ingredient) => ({
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
      }));
    const cleanSteps = steps.map((step) => step.trim()).filter(Boolean);

    const formValues = {
      title: title.trim(),
      description: description.trim(),
      category,
      prepTimeMinutes: Number(prepTimeMinutes),
      servings: Number(servings),
      ingredients: cleanIngredients,
      steps: cleanSteps,
      image,
    };

    try {
      const { recipe: savedRecipe } = await submit(formValues, {
        mode: isEditing ? 'update' : 'create',
        id: recipe?._id,
      });
      navigate(`/recipes/${savedRecipe._id}`);
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {formError && (
        <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-image" className={labelClass}>
          Photo
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="aspect-4/3 w-full max-w-[220px] overflow-hidden rounded-2xl bg-gold-light">
            {imagePreview ? (
              <img src={imagePreview} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>
          <input
            id="recipe-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-navy/70 file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-[0.08em] file:text-cream-base"
          />
        </div>
        {fieldErrors.image && <p className={fieldErrorClass}>{fieldErrors.image}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-title" className={labelClass}>
          Title
        </label>
        <input
          id="recipe-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className={inputClass}
          placeholder="Garlic butter pasta"
        />
        {fieldErrors.title && <p className={fieldErrorClass}>{fieldErrors.title}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-description" className={labelClass}>
          Description
        </label>
        <textarea
          id="recipe-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className={inputClass}
          placeholder="A quick weeknight pasta with a garlicky, buttery sauce."
        />
        {fieldErrors.description && <p className={fieldErrorClass}>{fieldErrors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-category" className={labelClass}>
            Category
          </label>
          <select
            id="recipe-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={inputClass}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {fieldErrors.category && <p className={fieldErrorClass}>{fieldErrors.category}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-prep-time" className={labelClass}>
            Prep time (min)
          </label>
          <input
            id="recipe-prep-time"
            type="number"
            min={0}
            value={prepTimeMinutes}
            onChange={(event) => setPrepTimeMinutes(event.target.value)}
            className={inputClass}
          />
          {fieldErrors.prepTimeMinutes && (
            <p className={fieldErrorClass}>{fieldErrors.prepTimeMinutes}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-servings" className={labelClass}>
            Servings
          </label>
          <input
            id="recipe-servings"
            type="number"
            min={1}
            value={servings}
            onChange={(event) => setServings(event.target.value)}
            className={inputClass}
          />
          {fieldErrors.servings && <p className={fieldErrorClass}>{fieldErrors.servings}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Ingredients</span>

        <div className="flex flex-col gap-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={ingredient.name}
                onChange={(event) => updateIngredient(index, 'name', event.target.value)}
                className={`${inputClass} sm:flex-1`}
                placeholder="Garlic"
                aria-label={`Ingredient ${index + 1} name`}
              />
              <input
                value={ingredient.quantity}
                onChange={(event) => updateIngredient(index, 'quantity', event.target.value)}
                className={`${inputClass} sm:w-40`}
                placeholder="4 cloves"
                aria-label={`Ingredient ${index + 1} quantity`}
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                disabled={ingredients.length === 1}
                className="rounded-full border border-navy/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-navy/70 transition hover:border-burnt-orange hover:text-burnt-orange disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addIngredient}
          className="self-start rounded-full bg-cream-alt px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-navy transition hover:bg-gold-light"
        >
          + Add ingredient
        </button>
        {fieldErrors.ingredients && <p className={fieldErrorClass}>{fieldErrors.ingredients}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelClass}>Steps</span>

        <div className="flex flex-col gap-2">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-2">
              <span className="mt-2.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-navy font-mono text-[11px] text-cream-base">
                {index + 1}
              </span>
              <textarea
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                rows={2}
                className={`${inputClass} flex-1`}
                placeholder={`Step ${index + 1}`}
                aria-label={`Step ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                disabled={steps.length === 1}
                className="self-start rounded-full border border-navy/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-navy/70 transition hover:border-burnt-orange hover:text-burnt-orange disabled:cursor-not-allowed disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="self-start rounded-full bg-cream-alt px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-navy transition hover:bg-gold-light"
        >
          + Add step
        </button>
        {fieldErrors.steps && <p className={fieldErrorClass}>{fieldErrors.steps}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center self-start rounded-full bg-navy px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? isEditing
            ? 'Saving...'
            : 'Creating...'
          : isEditing
            ? 'Save changes'
            : 'Create recipe'}
      </button>
    </form>
  );
}
