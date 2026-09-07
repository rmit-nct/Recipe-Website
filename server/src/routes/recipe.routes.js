import { Router } from 'express';
import {
  getRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from '../controllers/recipe.controller.js';
import { getComments, createComment } from '../controllers/comment.controller.js';
import { upsertRating } from '../controllers/rating.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';
import {
  listRecipesQuerySchema,
  createRecipeSchema,
  updateRecipeSchema,
} from '../validators/recipe.validators.js';
import { createCommentSchema } from '../validators/comment.validators.js';
import { upsertRatingSchema } from '../validators/rating.validators.js';

const router = Router();

// Every route here is role-gated — there is no anonymous read path for
// recipes, comments, or ratings (docs/API_CONTRACT.md § Role Gate).
router.get('/', requireAuth, validateQuery(listRecipesQuerySchema), getRecipes);

// uploadSingleImage runs BEFORE validateBody: multipart means req.body does not
// exist until multer has consumed the request stream.
router.post(
  '/',
  requireAuth,
  uploadSingleImage,
  validateBody(createRecipeSchema),
  createRecipe,
);

router.get('/:id', requireAuth, getRecipeById);
router.put('/:id', requireAuth, validateBody(updateRecipeSchema), updateRecipe);
router.delete('/:id', requireAuth, deleteRecipe);

router.get('/:id/comments', requireAuth, getComments);
router.post('/:id/comments', requireAuth, validateBody(createCommentSchema), createComment);

router.put('/:id/rating', requireAuth, validateBody(upsertRatingSchema), upsertRating);

export default router;
