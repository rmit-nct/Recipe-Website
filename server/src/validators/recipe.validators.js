import { z } from 'zod';

// Query params for GET /api/recipes, per docs/API_CONTRACT.md:
//   ?search=&category=&sort=top|new
// All three are optional; omitting every one lists all recipes.
export const listRecipesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  category: z.enum(['food', 'bakery']).optional(),
  sort: z.enum(['top', 'new']).optional(),
});

// Field names below are an exact match to the Recipe @typedef in
// docs/DATA_SHAPES.md. `quantity` is a string ("200 g"), not a number.
const ingredientSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.string().trim().min(1),
});

// `ingredients` and `steps` arrive over multipart as JSON strings — multipart
// form data carries flat strings only, so the client sends
// FormData.append('ingredients', JSON.stringify([...])). Parse the string back
// into a value before the array schema sees it.
const jsonArrayField = (itemSchema) =>
  z
    .preprocess((value) => {
      if (typeof value !== 'string') return value;
      try {
        return JSON.parse(value);
      } catch {
        // Hand the raw string through so the array check produces the error,
        // rather than throwing out of the preprocessor.
        return value;
      }
    }, z.array(itemSchema))
    .refine((items) => items.length > 0, { message: 'must contain at least one item' });

// POST /api/recipes — multipart (docs/API_CONTRACT.md: "recipe fields + image
// file"). Every scalar arrives as a string, hence z.coerce on the numbers.
// `imageUrl` is absent here: it is set by the controller from the Cloudinary
// upload, never accepted from the client on create.
export const createRecipeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(['food', 'bakery']),
  prepTimeMinutes: z.coerce.number().int().min(0),
  servings: z.coerce.number().int().min(1),
  ingredients: jsonArrayField(ingredientSchema),
  steps: jsonArrayField(z.string().trim().min(1)),
});

// PUT /api/recipes/:id — docs/API_CONTRACT.md says "recipe fields to update"
// and does NOT mark this row multipart, so this is a JSON body: real numbers,
// real arrays, no coercion. Every field optional (partial update), but at
// least one must be present or the request is a no-op.
export const updateRecipeSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().min(1).max(5000).optional(),
    category: z.enum(['food', 'bakery']).optional(),
    imageUrl: z.string().trim().url().optional(),
    prepTimeMinutes: z.number().int().min(0).optional(),
    servings: z.number().int().min(1).optional(),
    ingredients: z.array(ingredientSchema).min(1).optional(),
    steps: z.array(z.string().trim().min(1)).min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'provide at least one field to update',
  });
