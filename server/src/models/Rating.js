import mongoose from 'mongoose';

/**
 * @typedef {Object} Rating
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {number} value       // 1..5
 * @property {string} createdAt
 * @property {string} updatedAt
 */

const ratingSchema = new mongoose.Schema(
  {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true },
);

// One rating per user per recipe. Enforced here, not just in the controller, so a
// concurrent double-submit cannot create a second row and inflate ratingCount.
ratingSchema.index({ recipeId: 1, author: 1 }, { unique: true });

// Formats the rating exactly as the Rating @typedef in docs/DATA_SHAPES.md demands.
// Expects `author` to have been populated with { _id, username }.
ratingSchema.methods.toPublicObject = function () {
  return {
    _id: this._id,
    recipeId: this.recipeId,
    author: this.author && this.author.username
      ? { _id: this.author._id, username: this.author.username }
      : this.author,
    value: this.value,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Rating', ratingSchema);
