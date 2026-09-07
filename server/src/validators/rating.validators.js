import { z } from 'zod';

// PUT /api/recipes/:id/rating body, per docs/API_CONTRACT.md: { value: 1..5 }
export const upsertRatingSchema = z.object({
  value: z.number().int().min(1).max(5),
});
