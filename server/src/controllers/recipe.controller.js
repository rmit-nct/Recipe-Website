// Hardcoded fake recipes to prove the request path works before
// wiring up the database. Replace with real DB queries later.
// Shape mirrors the Recipe @typedef in docs/DATA_SHAPES.md.
const fakeRecipes = [
  {
    _id: '1',
    title: 'Creamy Garlic Parmesan Pasta',
    description: 'A quick and comforting one-pot pasta tossed in a rich garlic parmesan sauce.',
    category: 'food',
    imageUrl: 'https://example.com/images/garlic-pasta.jpg',
    prepTimeMinutes: 10,
    servings: 4,
    ingredients: [
      { name: 'Spaghetti', quantity: '200 g' },
      { name: 'Garlic', quantity: '4 cloves' },
      { name: 'Parmesan cheese', quantity: '50 g' },
    ],
    steps: [
      'Cook the spaghetti according to package instructions.',
      'Sauté minced garlic in butter until fragrant.',
      'Toss the pasta with the garlic butter and parmesan.',
    ],
    author: { _id: 'seed-user-1', username: 'seedchef' },
    averageRating: 4.5,
    ratingCount: 2,
    createdAt: '2026-01-05T09:00:00.000Z',
    updatedAt: '2026-01-05T09:00:00.000Z',
  },
  {
    _id: '2',
    title: 'Fluffy Banana Pancakes',
    description: 'Light and fluffy pancakes made with ripe bananas and a hint of cinnamon.',
    category: 'bakery',
    imageUrl: 'https://example.com/images/banana-pancakes.jpg',
    prepTimeMinutes: 5,
    servings: 2,
    ingredients: [
      { name: 'Ripe bananas', quantity: '2' },
      { name: 'Flour', quantity: '150 g' },
      { name: 'Cinnamon', quantity: '1 tsp' },
    ],
    steps: [
      'Mash the bananas and mix with the wet ingredients.',
      'Fold in the flour and cinnamon.',
      'Cook spoonfuls of batter on a hot griddle until golden.',
    ],
    author: { _id: 'seed-user-2', username: 'pancakepro' },
    averageRating: 4.8,
    ratingCount: 5,
    createdAt: '2026-01-06T09:00:00.000Z',
    updatedAt: '2026-01-06T09:00:00.000Z',
  },
  {
    _id: '3',
    title: 'Hearty Vegetable Stir-Fry',
    description: 'A colorful medley of fresh vegetables stir-fried in a savory soy-ginger sauce.',
    category: 'food',
    imageUrl: 'https://example.com/images/veg-stirfry.jpg',
    prepTimeMinutes: 15,
    servings: 3,
    ingredients: [
      { name: 'Broccoli', quantity: '150 g' },
      { name: 'Bell pepper', quantity: '1' },
      { name: 'Soy sauce', quantity: '2 tbsp' },
      { name: 'Ginger', quantity: '1 tbsp' },
    ],
    steps: [
      'Chop all vegetables into bite-sized pieces.',
      'Stir-fry vegetables over high heat for 3-4 minutes.',
      'Add the soy-ginger sauce and toss until coated.',
    ],
    author: { _id: 'seed-user-1', username: 'seedchef' },
    averageRating: 4.2,
    ratingCount: 3,
    createdAt: '2026-01-07T09:00:00.000Z',
    updatedAt: '2026-01-07T09:00:00.000Z',
  },
];

export const getRecipes = (req, res) => {
  res.json({ data: { recipes: fakeRecipes } });
};
