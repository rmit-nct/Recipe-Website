import mongoose from 'mongoose';

/**
 * @typedef {Object} Comment
 * @property {string} _id
 * @property {string} recipeId
 * @property {{_id: string, username: string}} author
 * @property {string} body
 * @property {string} createdAt
 */

const commentSchema = new mongoose.Schema(
  {
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// A recipe's comment thread is always read newest-first for one recipe.
commentSchema.index({ recipeId: 1, createdAt: -1 });

// Formats the comment exactly as the Comment @typedef in docs/DATA_SHAPES.md demands.
// Expects `author` to have been populated with { _id, username }.
commentSchema.methods.toPublicObject = function () {
  return {
    _id: this._id,
    recipeId: this.recipeId,
    author: this.author && this.author.username
      ? { _id: this.author._id, username: this.author.username }
      : this.author,
    body: this.body,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Comment', commentSchema);
