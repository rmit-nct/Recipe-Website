import { z } from 'zod';

// POST /api/recipes/:id/comments body, per docs/API_CONTRACT.md: { body }
// `body` is the ratified field name from the Comment @typedef in
// docs/DATA_SHAPES.md — not `text`, not `content` (see CLAUDE.md §11).
export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});
