// RecipeCard.jsx
// Phase 1 — Frontend Feature Dev
// Static visual component only. Renders whatever Recipe-shaped object is
// passed in via props; wiring to the live API comes in a later phase (NR4).

import './RecipeCard.css';

export default function RecipeCard({ recipe }) {
  const {
    title,
    description,
    category,
    imageUrl,
    prepTimeMinutes,
    servings,
    averageRating,
    ratingCount,
  } = recipe;

  return (
    <div className="recipe-card w-full max-w-full sm:max-w-sm md:max-w-md lg:max-w-sm mx-auto p-4 md:p-5">
      <span className="recipe-card__eyebrow block text-[11px] md:text-xs">
        {category}
      </span>

      <div className="recipe-card__photo">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="recipe-card__photo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="recipe-card__photo-placeholder">
            <span>photo</span>
          </div>
        )}
        <span className="recipe-card__corner recipe-card__corner--tl" />
        <span className="recipe-card__corner recipe-card__corner--tr" />
        <span className="recipe-card__corner recipe-card__corner--bl" />
        <span className="recipe-card__corner recipe-card__corner--br" />
      </div>

      <div className="recipe-card__body pt-3 md:pt-4">
        <h3 className="recipe-card__title text-lg md:text-xl">{title}</h3>
        <p className="recipe-card__desc text-[13px] md:text-[13.5px]">{description}</p>

        <div className="recipe-card__divider" />

        <div className="recipe-card__footer">
          <span className="recipe-card__meta text-xs">
            {prepTimeMinutes} min · Serves {servings}
          </span>
          <span className="recipe-card__rating text-xs">
            <span className="recipe-card__rating-dot" />
            {averageRating} ({ratingCount})
          </span>
        </div>
      </div>
    </div>
  );
}
