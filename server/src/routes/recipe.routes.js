import { Router } from 'express';
import { getRecipes } from '../controllers/recipe.controller.js';

const router = Router();

router.get('/', getRecipes);

export default router;
