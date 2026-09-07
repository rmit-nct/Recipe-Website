import { Router } from 'express';
import { deleteComment } from '../controllers/comment.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Ownership is re-checked in the controller — requireAuth proves identity only.
router.delete('/:id', requireAuth, deleteComment);

export default router;
