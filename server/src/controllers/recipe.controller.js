// Hardcoded fake recipes to prove the request path works before
// wiring up the database. Replace with real DB queries later.
const fakeRecipes = [
  {
    id: '1',
    title: 'Creamy Garlic Parmesan Pasta',
    description: 'A quick and comforting one-pot pasta tossed in a rich garlic parmesan sauce.',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 4,
    imageUrl: 'https://example.com/images/garlic-pasta.jpg',
  },
  {
    id: '2',
    title: 'Fluffy Banana Pancakes',
    description: 'Light and fluffy pancakes made with ripe bananas and a hint of cinnamon.',
    prepTimeMinutes: 5,
    cookTimeMinutes: 10,
    servings: 2,
    imageUrl: 'https://example.com/images/banana-pancakes.jpg',
  },
  {
    id: '3',
    title: 'Hearty Vegetable Stir-Fry',
    description: 'A colorful medley of fresh vegetables stir-fried in a savory soy-ginger sauce.',
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 3,
    imageUrl: 'https://example.com/images/veg-stirfry.jpg',
  },
];

export const getRecipes = (req, res) => {
  res.json(fakeRecipes);
};
