// RecipeCard.jsx
// Phase 1 — Frontend Feature Dev
// Static visual component only. Sample data is hardcoded for now;
// wiring to real recipe data comes in a later phase.

import "./RecipeCard.css";

export default function RecipeCard() {
  return (
    <div className="recipe-card">
      <span className="recipe-card__eyebrow">Recipe No. 014</span>

      <div className="recipe-card__photo">
        <div className="recipe-card__photo-placeholder">
          <span>photo</span>
        </div>
        <span className="recipe-card__corner recipe-card__corner--tl" />
        <span className="recipe-card__corner recipe-card__corner--tr" />
        <span className="recipe-card__corner recipe-card__corner--bl" />
        <span className="recipe-card__corner recipe-card__corner--br" />
      </div>

      <div className="recipe-card__body">
        <h3 className="recipe-card__title">Garlic Butter Shrimp Pasta</h3>
        <p className="recipe-card__desc">
          A quick weeknight favorite — plump shrimp tossed in a garlicky
          butter-white wine sauce over al dente linguine, finished with
          parsley and lemon zest.
        </p>

        <div className="recipe-card__divider" />

        <div className="recipe-card__footer">
          <span className="recipe-card__meta">25 min · Serves 2</span>
          <span className="recipe-card__rating">
            <span className="recipe-card__rating-dot" />
            4.8
          </span>
        </div>
      </div>
    </div>
  );
}
