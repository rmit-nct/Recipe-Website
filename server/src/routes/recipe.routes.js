import { Router } from 'express';
import { getRecipes } from '../controllers/recipe.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js'; // 1. Import middleware

const router = Router();

// 2. Add requireAuth to role-gate the route
router.get('/', requireAuth, getRecipes);

export default router;