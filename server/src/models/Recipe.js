import mongoose from 'mongoose';

/**
 * @typedef {Object} Ingredient
 * @property {string} name
 * @property {string} quantity  // "200 g" — string, not number. Units are messy; don't over-model.
 */

/**
 * @typedef {Object} Recipe
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {'food'|'bakery'} category
 * @property {string | null} imageUrl  // null when the recipe was created with no photo
 * @property {number} prepTimeMinutes
 * @property {number} servings
 * @property {Ingredient[]} ingredients
 * @property {string[]} steps
 * @property {{_id: string, username: string}} author
 * @property {number} averageRating
 * @property {number} ratingCount
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['food', 'bakery'] },
    // Optional — a recipe may be created with no photo (docs/API_CONTRACT.md
    // § File Uploads). Defaults to null rather than staying undefined, so
    // every recipe response consistently carries the key.
    imageUrl: { type: String, required: false, trim: true, default: null },
    prepTimeMinutes: { type: Number, required: true, min: 0 },
    servings: { type: Number, required: true, min: 1 },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Denormalized: written by the rating controller, never recomputed on read
    // (handbook §5.3 — reads outnumber writes ~100:1).
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// `?search=` matches recipe title OR ingredient name; `?sort=top` sorts on the
// denormalized rating. Indexed so neither degrades to a collection scan.
recipeSchema.index({ title: 1 });
recipeSchema.index({ 'ingredients.name': 1 });
recipeSchema.index({ averageRating: -1, ratingCount: -1 });
recipeSchema.index({ createdAt: -1 });

// Formats the recipe exactly as the Recipe @typedef in docs/DATA_SHAPES.md demands.
// Expects `author` to have been populated with { _id, username }.
recipeSchema.methods.toPublicObject = function () {
  return {
    _id: this._id,
    title: this.title,
    description: this.description,
    category: this.category,
    imageUrl: this.imageUrl,
    prepTimeMinutes: this.prepTimeMinutes,
    servings: this.servings,
    ingredients: this.ingredients.map((ingredient) => ({
      name: ingredient.name,
      quantity: ingredient.quantity,
    })),
    steps: this.steps,
    author: this.author && this.author.username
      ? { _id: this.author._id, username: this.author.username }
      : this.author,
    averageRating: this.averageRating,
    ratingCount: this.ratingCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Recipe', recipeSchema);
