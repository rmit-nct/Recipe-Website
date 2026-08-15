// Static fixture data for NR3 — matches the Recipe @typedef in docs/DATA_SHAPES.md.
// Wiring this component to the real API is out of scope here (see NR4).
export const fakeRecipes = [
  {
    _id: '1',
    title: 'Garlic Butter Shrimp Pasta',
    description:
      'A quick weeknight favorite — plump shrimp tossed in a garlicky butter-white wine sauce over al dente linguine, finished with parsley and lemon zest.',
    category: 'food',
    imageUrl: 'https://example.com/images/garlic-shrimp-pasta.jpg',
    prepTimeMinutes: 25,
    servings: 2,
    ingredients: [
      { name: 'Shrimp', quantity: '300 g' },
      { name: 'Linguine', quantity: '200 g' },
      { name: 'Garlic', quantity: '4 cloves' },
      { name: 'Butter', quantity: '3 tbsp' },
      { name: 'White wine', quantity: '1/2 cup' },
    ],
    steps: [
      'Cook linguine until al dente.',
      'Sauté shrimp in butter and garlic until pink.',
      'Deglaze with white wine and toss with the pasta.',
      'Finish with parsley and lemon zest.',
    ],
    author: { _id: 'seed-user-1', username: 'seedchef' },
    averageRating: 4.8,
    ratingCount: 6,
    createdAt: '2026-01-08T09:00:00.000Z',
    updatedAt: '2026-01-08T09:00:00.000Z',
  },
];
