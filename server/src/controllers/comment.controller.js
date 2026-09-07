import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';

const notFound = (res, message) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message } });

const internalError = (res) =>
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });

/**
 * GET /api/recipes/:id/comments — session required.
 * @returns {{ data: { comments: Comment[] } }}
 */
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound(res, 'Recipe not found');
    }

    const recipe = await Recipe.findById(id).select('_id');
    if (!recipe) {
      return notFound(res, 'Recipe not found');
    }

    const comments = await Comment.find({ recipeId: id })
      .sort({ createdAt: -1 })
      .populate('author', 'username');

    return res.status(200).json({
      data: { comments: comments.map((comment) => comment.toPublicObject()) },
    });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * POST /api/recipes/:id/comments — session required. Body: { body }
 * @returns {{ data: { comment: Comment } }}
 */
export const createComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound(res, 'Recipe not found');
    }

    const recipe = await Recipe.findById(id).select('_id');
    if (!recipe) {
      return notFound(res, 'Recipe not found');
    }

    const { body } = req.validated;

    // Identity comes from the verified JWT, never from req.body (CLAUDE.md §9).
    const comment = await Comment.create({
      recipeId: id,
      author: req.user.id,
      body,
    });

    await comment.populate('author', 'username');

    return res.status(201).json({ data: { comment: comment.toPublicObject() } });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * DELETE /api/comments/:id — session required, author only.
 * @returns 204 No Content
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound(res, 'Comment not found');
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return notFound(res, 'Comment not found');
    }

    // requireAuth proved *someone* is logged in; it says nothing about whose
    // comment this is. 401 = "who are you?", 403 = "I know you, and no."
    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Not the owner' },
      });
    }

    await comment.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return internalError(res);
  }
};
