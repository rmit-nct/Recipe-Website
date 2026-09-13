import { useState } from 'react';
import { putRating } from '../../api/ratings.js';

const STAR_VALUES = [1, 2, 3, 4, 5];

/**
 * Star rating widget for a recipe: shows the recipe's aggregate
 * averageRating/ratingCount, and lets the logged-in user submit or change
 * their own 1-5 rating.
 *
 * The backend has no endpoint to fetch a user's pre-existing rating for a
 * recipe (docs/API_CONTRACT.md only exposes the idempotent PUT) — so "your
 * rating" can only be tracked from what's been submitted in this session,
 * not restored from a prior one.
 *
 * PUT /api/recipes/:id/rating returns `{ data: { rating } }` only — it does
 * not include the recipe's updated averageRating/ratingCount (those live on
 * Recipe, not Rating, per docs/DATA_SHAPES.md). `onRated` lets the parent
 * re-fetch the recipe to pick up the new totals.
 *
 * @param {{
 *   recipeId: string,
 *   averageRating: number,
 *   ratingCount: number,
 *   onRated: () => void,
 * }} props
 */
export default function RatingWidget({ recipeId, averageRating, ratingCount, onRated }) {
  const [myRating, setMyRating] = useState(null);
  const [hoverValue, setHoverValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleRate(value) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { rating } = await putRating(recipeId, value);
      setMyRating(rating.value);
      onRated?.();
    } catch (err) {
      setError(err.message || 'Could not submit your rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayValue = hoverValue || myRating || 0;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-light px-3 py-1.5 font-mono text-[11px] text-navy">
        <span className="h-1.5 w-1.5 rounded-full bg-burnt-orange" />
        {averageRating}
        <span className="text-navy/55">({ratingCount})</span>
      </span>

      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-0.5"
          onMouseLeave={() => setHoverValue(0)}
          role="radiogroup"
          aria-label="Rate this recipe"
        >
          {STAR_VALUES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={myRating === value}
              aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
              disabled={isSubmitting}
              onMouseEnter={() => setHoverValue(value)}
              onClick={() => handleRate(value)}
              className="text-xl leading-none transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className={value <= displayValue ? 'text-gold' : 'text-navy/20'}>★</span>
            </button>
          ))}
        </div>

        <span className="font-mono text-xs text-navy/60">
          {myRating ? `Your rating: ${myRating}` : 'Rate this recipe'}
        </span>
      </div>

      {error ? (
        <p className="w-full rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {error}
        </p>
      ) : null}
    </div>
  );
}
