import NeoRibbon from '../../components/NeoRibbon.jsx';

/**
 * @typedef {Object} Recipe — mirrors docs/DATA_SHAPES.md
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {'food'|'bakery'} category
 * @property {string} imageUrl
 * @property {number} prepTimeMinutes
 * @property {number} servings
 * @property {number} averageRating
 * @property {number} ratingCount
 */

/**
 * Presentational recipe card. Colors and type come from docs/DESIGN_SYSTEM.md
 * tokens only — navy text on light surfaces, gold reserved for surfaces.
 * @param {{ recipe: Recipe }} props
 */
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
    <article className="group flex flex-col rounded-3xl border border-navy/10 bg-cream-base p-3 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-gold hover:shadow-lg focus-within:border-gold md:p-4">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-gold-light">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.remove();
            }}
          />
        ) : null}

        {/* Fallback sits behind the image, so a broken URL reveals the brand
            mark instead of a torn-image icon. */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center text-navy">
          <NeoRibbon className="h-10 w-10 opacity-40" />
        </div>

        <span className="absolute left-3 top-3 rounded-full bg-gold px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-navy md:text-[11px]">
          {category}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4 md:pt-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-navy md:text-xl">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-navy/70">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="rounded-full bg-cream-alt px-3 py-1.5 font-mono text-[11px] text-navy">
            {prepTimeMinutes} min · serves {servings}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-light px-3 py-1.5 font-mono text-[11px] text-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-burnt-orange" />
            {averageRating}
            <span className="text-navy/55">({ratingCount})</span>
          </span>
        </div>
      </div>
    </article>
  );
}
