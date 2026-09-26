import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import Recipe from '../models/Recipe.js';

// Recomputes the recipe's denormalized rating fields from the Rating collection
// and persists them. Called on every rating write, never on read — the
// reads-cheap/writes-slightly-harder trade-off in handbook §5.3.
export const syncRecipeRating = async (recipeId) => {
  const [stats] = await Rating.aggregate([
    { $match: { recipeId: new mongoose.Types.ObjectId(recipeId) } },
    { $group: { _id: null, averageRating: { $avg: '$value' }, ratingCount: { $sum: 1 } } },
  ]);

  const averageRating = stats ? Math.round(stats.averageRating * 10) / 10 : 0;
  const ratingCount = stats ? stats.ratingCount : 0;

  // timestamps: false — rating someone else's recipe is not an edit of that
  // recipe, so it must not bump the recipe's own updatedAt.
  await Recipe.findByIdAndUpdate(
    recipeId,
    { averageRating, ratingCount },
    { timestamps: false },
  );
};

/**
 * PUT /api/recipes/:id/rating — session required. Body: { value: 1..5 }
 * Idempotent: resubmitting replaces this user's rating, it does not add one.
 * @returns {{ data: { rating: Rating } }}
 */
export const upsertRating = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Recipe not found' },
      });
    }

    const recipe = await Recipe.findById(id).select('_id');
    if (!recipe) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Recipe not found' },
      });
    }

    const { value } = req.validated;

    // Upsert on the (recipeId, author) pair — the same pair the unique index
    // guards — so a second PUT replaces the row instead of appending one.
    const filter = { recipeId: id, author: req.user.id };
    const update = { $set: { value } };
    const options = { new: true, upsert: true };

    let rating;
    try {
      rating = await Rating.findOneAndUpdate(filter, update, options);
    } catch (err) {
      // Two simultaneous first-time ratings from one user (a double-clicked star
      // widget) can both resolve to "insert", and the unique index rejects the
      // loser with E11000. The row it wanted now exists, so retrying matches it
      // and updates instead — the request still succeeds, as it should.
      if (err.code !== 11000) throw err;
      rating = await Rating.findOneAndUpdate(filter, update, options);
    }

    await syncRecipeRating(id);
    await rating.populate('author', 'username');

    return res.status(200).json({ data: { rating: rating.toPublicObject() } });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
};
