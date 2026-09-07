import mongoose from 'mongoose';
import Recipe from '../models/Recipe.js';
import { uploadImageBuffer } from '../config/cloudinary.js';

// User-supplied `?search=` goes into a regex, so escape anything the regex
// engine would otherwise treat as syntax.
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORT_ORDERS = {
  // Highest rated first; ratingCount breaks ties so a single 5-star recipe
  // doesn't outrank a well-reviewed one.
  top: { averageRating: -1, ratingCount: -1, createdAt: -1 },
  new: { createdAt: -1 },
};

/**
 * GET /api/recipes — session required (role gate, docs/API_CONTRACT.md).
 * Query: ?search=&category=&sort=top|new — all optional.
 * @returns {{ data: { recipes: Recipe[] } }}
 */
export const getRecipes = async (req, res) => {
  try {
    const { search, category, sort } = req.validated;

    const filter = {};

    if (search) {
      const pattern = new RegExp(escapeRegex(search), 'i');
      // Matches the recipe title OR any one of its ingredients' names.
      filter.$or = [{ title: pattern }, { 'ingredients.name': pattern }];
    }

    if (category) {
      filter.category = category;
    }

    const recipes = await Recipe.find(filter)
      .sort(SORT_ORDERS[sort] || SORT_ORDERS.new)
      .populate('author', 'username');

    return res.status(200).json({
      data: { recipes: recipes.map((recipe) => recipe.toPublicObject()) },
    });
  } catch (err) {
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
};

const notFound = (res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recipe not found' } });

const internalError = (res) =>
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });

/**
 * Loads a recipe for an owner-scoped mutation.
 * Returns the document, or null once it has already sent the 404/403 response.
 *
 * requireAuth proved *someone* is logged in; it says nothing about whose recipe
 * this is. 401 = "who are you?", 403 = "I know you, and no." (API_CONTRACT.md).
 */
const loadOwnedRecipe = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    notFound(res);
    return null;
  }

  const recipe = await Recipe.findById(id);
  if (!recipe) {
    notFound(res);
    return null;
  }

  if (recipe.author.toString() !== req.user.id) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not the owner' } });
    return null;
  }

  return recipe;
};

/**
 * POST /api/uploads — session required. Multipart: a single `image` file.
 * @returns {{ data: { url: string } }}
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'An image file is required' },
      });
    }

    const url = await uploadImageBuffer(req.file.buffer);

    return res.status(201).json({ data: { url } });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * GET /api/recipes/:id — session required (role gate).
 * @returns {{ data: { recipe: Recipe } }}
 */
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return notFound(res);
    }

    const recipe = await Recipe.findById(id).populate('author', 'username');
    if (!recipe) {
      return notFound(res);
    }

    return res.status(200).json({ data: { recipe: recipe.toPublicObject() } });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * POST /api/recipes — session required.
 * Multipart: recipe fields + an `image` file (docs/API_CONTRACT.md).
 * @returns {{ data: { recipe: Recipe } }}
 */
export const createRecipe = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'An image file is required' },
      });
    }

    // Zod has already run, so we only reach Cloudinary with a valid payload —
    // no orphaned uploads from requests that were going to 400 anyway.
    const imageUrl = await uploadImageBuffer(req.file.buffer);

    // author comes from the verified JWT, never from the request body — the
    // browser controls req.body and can lie about it (CLAUDE.md §9).
    const recipe = await Recipe.create({
      ...req.validated,
      imageUrl,
      author: req.user.id,
    });

    await recipe.populate('author', 'username');

    return res.status(201).json({ data: { recipe: recipe.toPublicObject() } });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * PUT /api/recipes/:id — session required, owner only.
 * @returns {{ data: { recipe: Recipe } }}
 */
export const updateRecipe = async (req, res) => {
  try {
    const recipe = await loadOwnedRecipe(req, res);
    if (!recipe) return undefined;

    // Only the fields the validator allows are assigned. author, averageRating
    // and ratingCount are absent from updateRecipeSchema, so a client cannot
    // reassign ownership or inflate its own rating through this endpoint.
    Object.assign(recipe, req.validated);
    await recipe.save();

    await recipe.populate('author', 'username');

    return res.status(200).json({ data: { recipe: recipe.toPublicObject() } });
  } catch (err) {
    return internalError(res);
  }
};

/**
 * DELETE /api/recipes/:id — session required, owner only.
 * @returns 204 No Content
 */
export const deleteRecipe = async (req, res) => {
  try {
    const recipe = await loadOwnedRecipe(req, res);
    if (!recipe) return undefined;

    await recipe.deleteOne();

    return res.status(204).send();
  } catch (err) {
    return internalError(res);
  }
};
