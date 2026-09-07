import { Router } from 'express';
import { uploadImage } from '../controllers/recipe.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = Router();

// Session required, but no ownership concept — nothing has been created yet.
router.post('/', requireAuth, uploadSingleImage, uploadImage);

export default router;
