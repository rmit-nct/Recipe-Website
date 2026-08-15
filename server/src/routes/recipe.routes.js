import { Router } from 'express';
import { getRecipes } from '../controllers/recipe.controller.js';

const router = Router();

// TODO(auth): API_CONTRACT.md requires a valid session on this route.
// No auth system exists yet — tracked for a later sprint, not NR1.
router.get('/', getRecipes);

export default router;
