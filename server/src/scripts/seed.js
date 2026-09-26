/**
 * Database seed script — realistic mock data for local dev and demoing.
 *
 * Run from `server/`:
 *   npm run seed            # seeds an empty database; refuses to touch a non-empty one
 *   npm run seed -- --force # wipes users/recipes/comments/ratings first, then reseeds
 *
 * RERUN BEHAVIOUR: not silently additive. If any of the four collections already
 * holds a document, the script warns and exits with code 1 unless `--force` is
 * passed. `--force` deletes EVERY document in User/Recipe/Comment/Rating (not just
 * previously seeded ones) and reseeds from scratch, so never point it at a
 * database whose contents matter.
 *
 * Connects with the same MONGODB_URI the app uses (server/.env) — no connection
 * string is hardcoded here.
 *
 * SEEDED LOGIN (all five users share it, for live demoing):
 *   email:    mina@neorecipe.test
 *             (or dan@ / priya@ / tomas@ / aisha@neorecipe.test)
 *   password: NeoRecipe123!
 *
 * Images are stable picsum.photos seeded URLs — real, resolvable photographs.
 * Not food-specific, but the demo never shows a broken image. Fabricated
 * Cloudinary URLs are deliberately avoided: they 404 and break the visual demo
 * this data exists to support.
 */

import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Recipe from '../models/Recipe.js';
import Comment from '../models/Comment.js';
import Rating from '../models/Rating.js';
// Reused, not reimplemented: the rating endpoint's own recompute-and-persist of
// the denormalized averageRating/ratingCount. A second hand-rolled average here
// would silently drift from the real one the moment either changed.
import { syncRecipeRating } from '../controllers/rating.controller.js';

// Same cost factor as the real registration path (auth.controller.js).
const BCRYPT_COST = 10;

const DEMO_PASSWORD = 'NeoRecipe123!';

const imageFor = (slug) => `https://picsum.photos/seed/${slug}/1200/800`;

/** @type {{username: string, email: string}[]} */
const users = [
  { username: 'mina', email: 'mina@neorecipe.test' },
  { username: 'dan', email: 'dan@neorecipe.test' },
  { username: 'priya', email: 'priya@neorecipe.test' },
  { username: 'tomas', email: 'tomas@neorecipe.test' },
  { username: 'aisha', email: 'aisha@neorecipe.test' },
];

/**
 * Mock recipes. Field names are an exact match to the Recipe @typedef in
 * docs/DATA_SHAPES.md: title, description, category ('food'|'bakery'), imageUrl,
 * prepTimeMinutes, servings, ingredients [{ name, quantity }] (quantity is a
 * STRING, not a number), steps (string[]).
 *
 * `slug`, `author`, `daysAgo`, `ratings` and `comments` below are seed-only
 * wiring keyed by username — they are translated into real ObjectId references
 * and never written as recipe fields.
 *
 * Deliberate title/ingredient overlaps so search-by-ingredient is provably
 * distinct from search-by-title: "lemon", "ricotta", "baguette" and "butter"
 * each appear as an ingredient on one recipe and inside another recipe's title.
 *
 * `daysAgo` spreads createdAt across the last month so ?sort=new returns a
 * meaningfully different order from ?sort=top.
 */
const recipes = [
  {
    title: 'Honey Garlic Chicken Wings',
    slug: 'honey-garlic-wings',
    author: 'mina',
    daysAgo: 26,
    category: 'food',
    description:
      'Oven-baked wings finished in a sticky honey-garlic glaze. All of the lacquered finish of a deep fryer with none of the oil to dispose of afterwards.',
    prepTimeMinutes: 45,
    servings: 4,
    ingredients: [
      { name: 'chicken wings', quantity: '1 kg' },
      { name: 'honey', quantity: '3 tbsp' },
      { name: 'garlic', quantity: '4 cloves, minced' },
      { name: 'soy sauce', quantity: '3 tbsp' },
      { name: 'rice vinegar', quantity: '1 tbsp' },
      { name: 'sesame seeds', quantity: '1 tsp' },
    ],
    steps: [
      'Pat the wings completely dry and toss with a pinch of salt. Dry skin is the whole trick here.',
      'Bake on a rack at 220C for 35 minutes, turning once, until deeply golden.',
      'Simmer honey, soy sauce, garlic and vinegar for 3 minutes until it coats a spoon.',
      'Toss the hot wings through the glaze and scatter with sesame seeds.',
    ],
    ratings: { dan: 5, priya: 5, tomas: 4, aisha: 5 },
    comments: [
      { author: 'dan', body: 'Made these twice in one week. The rack is not optional, I tried without and they steamed.' },
      { author: 'aisha', body: 'Added a spoon of chilli crisp to the glaze and it was perfect.' },
      { author: 'priya', body: 'Doubled the glaze so there was some for dipping. No regrets.' },
    ],
  },
  {
    title: 'Smoky Paprika Beef Stew',
    slug: 'smoky-beef-stew',
    author: 'dan',
    daysAgo: 24,
    category: 'food',
    description:
      'A low-and-slow stew built on smoked paprika rather than tomato, so it tastes like it spent the afternoon over coals. Better on the second day.',
    prepTimeMinutes: 180,
    servings: 6,
    ingredients: [
      { name: 'beef chuck', quantity: '1.2 kg, cubed' },
      { name: 'smoked paprika', quantity: '2 tbsp' },
      { name: 'onion', quantity: '2, sliced' },
      { name: 'carrot', quantity: '3, thick rounds' },
      { name: 'potato', quantity: '500 g, halved' },
      { name: 'beef stock', quantity: '1 L' },
      { name: 'bay leaves', quantity: '2' },
    ],
    steps: [
      'Brown the beef hard in batches. Crowding the pan gives you grey meat and no fond.',
      'Soften the onion in the same pot, then stir in the smoked paprika off the heat for 30 seconds.',
      'Return the beef, add stock and bay, and simmer covered for 2 hours.',
      'Add carrot and potato and cook a further 40 minutes until everything yields to a spoon.',
      'Rest off the heat for 20 minutes before serving.',
    ],
    ratings: { mina: 4, priya: 5, tomas: 4 },
    comments: [
      { author: 'priya', body: 'The off-heat paprika step matters, it burned for me the first time I rushed it.' },
      { author: 'tomas', body: 'Served this with the no-knead baguette from this site. Excellent combination.' },
    ],
  },
  {
    title: 'Miso Butter Ramen',
    slug: 'miso-butter-ramen',
    author: 'priya',
    daysAgo: 21,
    category: 'food',
    description:
      'A weeknight bowl, not a two-day tonkotsu. Whisking cold butter into a miso broth gives it a richness that usually takes hours of bones.',
    prepTimeMinutes: 30,
    servings: 2,
    ingredients: [
      { name: 'ramen noodles', quantity: '2 portions' },
      { name: 'white miso paste', quantity: '3 tbsp' },
      { name: 'butter', quantity: '30 g, cold' },
      { name: 'chicken stock', quantity: '800 ml' },
      { name: 'egg', quantity: '2' },
      { name: 'spring onion', quantity: '3, sliced' },
      { name: 'sweetcorn', quantity: '100 g' },
    ],
    steps: [
      'Soft-boil the eggs for 6 minutes 30 seconds and plunge into iced water.',
      'Warm the stock, then whisk the miso into a ladleful of it before adding it back. Miso clumps if you dump it straight in.',
      'Take the broth off the boil and whisk in the cold butter until glossy.',
      'Cook the noodles separately so their starch does not cloud the broth.',
      'Assemble with halved eggs, corn and spring onion.',
    ],
    ratings: { mina: 5, dan: 4, aisha: 4, tomas: 5 },
    comments: [
      { author: 'mina', body: 'Never would have thought of butter in ramen. Completely converted.' },
      { author: 'dan', body: 'Cooking the noodles separately made a bigger difference than I expected.' },
    ],
  },
  {
    title: 'Garlic Butter Prawn Linguine',
    slug: 'prawn-linguine',
    author: 'tomas',
    daysAgo: 19,
    category: 'food',
    description:
      'Fifteen minutes, one pan, six ingredients. The pasta water is the sauce, so do not tip it down the sink.',
    prepTimeMinutes: 20,
    servings: 2,
    ingredients: [
      { name: 'linguine', quantity: '200 g' },
      { name: 'prawns', quantity: '300 g, peeled' },
      { name: 'garlic', quantity: '3 cloves, sliced' },
      { name: 'butter', quantity: '50 g' },
      { name: 'lemon', quantity: '1, zest and juice' },
      { name: 'flat-leaf parsley', quantity: 'small handful' },
    ],
    steps: [
      'Boil the linguine in well-salted water and reserve a mug of the cooking water.',
      'Sizzle the garlic gently in butter. Browned garlic turns the whole dish bitter.',
      'Add the prawns and cook 2 minutes a side until just opaque.',
      'Toss the drained pasta through with lemon, parsley and a splash of pasta water until it emulsifies.',
    ],
    ratings: { mina: 4, priya: 4, aisha: 3 },
    comments: [
      { author: 'aisha', body: 'Good but I wanted more acid, I ended up using two lemons.' },
      { author: 'mina', body: 'The emulsifying splash of pasta water is what makes this work.' },
    ],
  },
  {
    title: 'Charred Corn and Black Bean Tacos',
    slug: 'corn-bean-tacos',
    author: 'aisha',
    daysAgo: 17,
    category: 'food',
    description:
      'Vegetarian tacos that do not feel like a compromise. Charring the corn dry in a hot pan is what gives them their smokiness.',
    prepTimeMinutes: 25,
    servings: 4,
    ingredients: [
      { name: 'sweetcorn', quantity: '3 cobs, kernels cut off' },
      { name: 'black beans', quantity: '400 g tin, drained' },
      { name: 'corn tortillas', quantity: '8' },
      { name: 'lime', quantity: '2' },
      { name: 'coriander', quantity: 'large handful' },
      { name: 'feta', quantity: '80 g, crumbled' },
      { name: 'chipotle in adobo', quantity: '1 tbsp' },
    ],
    steps: [
      'Char the corn kernels in a dry cast-iron pan until blackened in patches. Do not stir constantly.',
      'Warm the beans with the chipotle and a squeeze of lime.',
      'Toast the tortillas directly over a flame for a few seconds a side.',
      'Fill and finish with feta, coriander and more lime.',
    ],
    ratings: { dan: 4, priya: 5, tomas: 3 },
    comments: [
      { author: 'tomas', body: 'Solid midweek dinner. I added pickled onion.' },
      { author: 'priya', body: 'The dry-pan char is the whole recipe. Worth the smoke alarm.' },
    ],
  },
  {
    title: 'Slow-Roasted Tomato and Basil Soup',
    slug: 'tomato-basil-soup',
    author: 'mina',
    daysAgo: 15,
    category: 'food',
    description:
      'Roasting the tomatoes for ninety minutes instead of simmering them concentrates everything. No stock needed, and no sugar to correct the acidity.',
    prepTimeMinutes: 110,
    servings: 4,
    ingredients: [
      { name: 'roma tomatoes', quantity: '1.5 kg, halved' },
      { name: 'garlic', quantity: '1 whole head' },
      { name: 'basil', quantity: 'large bunch' },
      { name: 'olive oil', quantity: '4 tbsp' },
      { name: 'cream', quantity: '100 ml' },
    ],
    steps: [
      'Roast the tomatoes cut side up with the whole garlic head at 160C for 90 minutes.',
      'Squeeze the roasted garlic cloves out of their skins into the tray.',
      'Blend everything including the roasting juices, then stir through cream and torn basil.',
      'Season at the very end, once the liquid has reduced.',
    ],
    ratings: { dan: 5, aisha: 4, tomas: 4, priya: 4 },
    comments: [
      { author: 'dan', body: 'No stock and it still tastes like more than the sum of its parts.' },
      { author: 'aisha', body: 'I skipped the cream and it was still great, just sharper.' },
    ],
  },
  {
    title: 'Crispy Pork Banh Mi',
    slug: 'crispy-pork-banh-mi',
    author: 'dan',
    daysAgo: 13,
    category: 'food',
    description:
      'The pickle does the heavy lifting. Make it a day ahead and the sandwich comes together in the time it takes to warm the bread.',
    prepTimeMinutes: 90,
    servings: 4,
    ingredients: [
      { name: 'pork shoulder', quantity: '800 g' },
      { name: 'baguette', quantity: '2, halved' },
      { name: 'carrot', quantity: '2, julienned' },
      { name: 'daikon', quantity: '1 small, julienned' },
      { name: 'rice vinegar', quantity: '150 ml' },
      { name: 'coriander', quantity: 'handful' },
      { name: 'mayonnaise', quantity: '4 tbsp' },
    ],
    steps: [
      'Pickle the carrot and daikon in vinegar with a spoon of sugar and salt, ideally overnight.',
      'Roast the pork at 200C for 70 minutes until the skin crackles, then rest and slice.',
      'Warm the baguette until the crust is brittle.',
      'Build with mayonnaise, pork, a generous amount of drained pickle, and coriander.',
    ],
    ratings: { mina: 5, priya: 4, tomas: 5 },
    comments: [
      { author: 'mina', body: 'Made the pickle two days ahead, even better.' },
      { author: 'tomas', body: 'Use a real baguette for this, supermarket soft rolls collapse.' },
    ],
  },
  {
    title: 'Coconut Chickpea Curry',
    slug: 'coconut-chickpea-curry',
    author: 'priya',
    daysAgo: 11,
    category: 'food',
    description:
      'A pantry curry with a fresh finish. Blooming the spices in oil before the liquid goes in is the difference between this and a dull one.',
    prepTimeMinutes: 35,
    servings: 4,
    ingredients: [
      { name: 'chickpeas', quantity: '2 x 400 g tins, drained' },
      { name: 'coconut milk', quantity: '400 ml' },
      { name: 'onion', quantity: '1, finely diced' },
      { name: 'ginger', quantity: '3 cm, grated' },
      { name: 'ground cumin', quantity: '2 tsp' },
      { name: 'ground turmeric', quantity: '1 tsp' },
      { name: 'spinach', quantity: '200 g' },
      { name: 'lemon', quantity: '1, juice only' },
    ],
    steps: [
      'Soften the onion slowly for 10 minutes, longer than feels necessary.',
      'Add the ginger and dry spices and stir in the oil for 1 minute until fragrant.',
      'Add chickpeas and coconut milk and simmer 15 minutes to thicken.',
      'Wilt in the spinach and finish with lemon juice off the heat.',
    ],
    ratings: { mina: 4, dan: 3, aisha: 5 },
    comments: [
      { author: 'aisha', body: 'My new default weeknight dinner. Everything is already in the cupboard.' },
      { author: 'dan', body: 'Needed more salt than stated but the method is right.' },
    ],
  },
  {
    title: 'Sesame Soy Glazed Salmon',
    slug: 'sesame-soy-salmon',
    author: 'tomas',
    daysAgo: 9,
    category: 'food',
    description:
      'Twelve minutes start to finish. The glaze reduces in the pan around the fish, so there is nothing extra to wash up.',
    prepTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { name: 'salmon fillets', quantity: '2 x 180 g' },
      { name: 'soy sauce', quantity: '3 tbsp' },
      { name: 'honey', quantity: '1 tbsp' },
      { name: 'sesame oil', quantity: '1 tsp' },
      { name: 'ginger', quantity: '2 cm, grated' },
      { name: 'spring onion', quantity: '2, sliced' },
    ],
    steps: [
      'Sear the salmon skin side down in a dry hot pan for 4 minutes without moving it.',
      'Flip, then pour in the soy, honey, sesame oil and ginger.',
      'Spoon the reducing glaze over the fish for 3 minutes until it is syrupy.',
      'Finish with spring onion and serve immediately, the glaze stiffens as it cools.',
    ],
    ratings: { mina: 4, dan: 4, priya: 3, aisha: 4 },
    comments: [
      { author: 'priya', body: 'Watch the glaze at the end, mine caught in about twenty seconds.' },
      { author: 'mina', body: 'Skin came out properly crisp using a dry pan. Counterintuitive but it works.' },
    ],
  },
  {
    title: 'Lemon Ricotta Pancakes',
    slug: 'lemon-ricotta-pancakes',
    author: 'aisha',
    daysAgo: 8,
    category: 'bakery',
    description:
      'Folding whipped whites through a ricotta batter gives you pancakes that are closer to a souffle. Eat them the minute they leave the pan.',
    prepTimeMinutes: 30,
    servings: 4,
    ingredients: [
      { name: 'ricotta', quantity: '250 g' },
      { name: 'lemon', quantity: '1, zest and juice' },
      { name: 'plain flour', quantity: '150 g' },
      { name: 'eggs', quantity: '3, separated' },
      { name: 'milk', quantity: '150 ml' },
      { name: 'butter', quantity: '20 g, for the pan' },
      { name: 'caster sugar', quantity: '2 tbsp' },
    ],
    steps: [
      'Whisk the yolks, ricotta, milk, lemon zest and juice together.',
      'Fold in the flour and sugar just until combined. Lumps are fine, overmixing is not.',
      'Whip the whites to soft peaks and fold through in two additions.',
      'Cook on a moderate, buttered pan for 3 minutes a side. Too hot and the outside sets before the middle rises.',
    ],
    ratings: { mina: 5, dan: 5, priya: 5, tomas: 4 },
    comments: [
      { author: 'dan', body: 'These are the best pancakes on the site and I have made most of them.' },
      { author: 'tomas', body: 'Moderate heat is the key note. My first batch was raw in the middle.' },
      { author: 'mina', body: 'Worked with cottage cheese blitzed smooth when I had no ricotta.' },
    ],
  },
  {
    title: 'Brown Butter Chocolate Chip Cookies',
    slug: 'brown-butter-cookies',
    author: 'mina',
    daysAgo: 7,
    category: 'bakery',
    description:
      'Browning the butter and resting the dough overnight are the two steps people skip, and they are the two steps that matter.',
    prepTimeMinutes: 40,
    servings: 18,
    ingredients: [
      { name: 'butter', quantity: '230 g' },
      { name: 'dark chocolate', quantity: '250 g, chopped' },
      { name: 'brown sugar', quantity: '200 g' },
      { name: 'caster sugar', quantity: '100 g' },
      { name: 'plain flour', quantity: '300 g' },
      { name: 'eggs', quantity: '2' },
      { name: 'vanilla extract', quantity: '2 tsp' },
      { name: 'sea salt flakes', quantity: 'to finish' },
    ],
    steps: [
      'Brown the butter until it smells nutty and the milk solids are amber, then cool to room temperature.',
      'Beat with both sugars, then the eggs and vanilla.',
      'Fold in flour and chopped chocolate, then rest the dough in the fridge overnight.',
      'Bake at 180C for 11 minutes. They will look underdone and should.',
      'Finish with sea salt flakes while still hot.',
    ],
    ratings: { dan: 5, priya: 4, tomas: 5, aisha: 5 },
    comments: [
      { author: 'priya', body: 'The overnight rest genuinely changes the texture, do not skip it.' },
      { author: 'aisha', body: 'Chopped chocolate over chips, as written, gives you those puddles.' },
    ],
  },
  {
    title: 'Rustic No-Knead Baguette',
    slug: 'no-knead-baguette',
    author: 'dan',
    daysAgo: 6,
    category: 'bakery',
    description:
      'Four ingredients and no mixer. An overnight ferment does the work your hands would otherwise do, and gives you a far better crumb for it.',
    prepTimeMinutes: 120,
    servings: 2,
    ingredients: [
      { name: 'bread flour', quantity: '500 g' },
      { name: 'water', quantity: '375 ml, lukewarm' },
      { name: 'salt', quantity: '10 g' },
      { name: 'instant yeast', quantity: '3 g' },
    ],
    steps: [
      'Stir everything to a shaggy dough and leave covered at room temperature for 12 to 18 hours.',
      'Turn out, divide in two, and shape gently. Knocking out all the gas undoes the ferment.',
      'Prove 45 minutes on a floured tray, then slash three times.',
      'Bake at 240C with a tray of water in the oven for 25 minutes until deeply coloured.',
      'Cool on a rack completely, or the crumb goes gummy.',
    ],
    ratings: { mina: 4, priya: 3, aisha: 4 },
    comments: [
      { author: 'priya', body: 'My first two attempts were flat. The third worked once I stopped degassing the dough.' },
      { author: 'mina', body: 'The tray of water is what gives you the crust. Do not leave it out.' },
    ],
  },
  {
    title: 'Cardamom Cinnamon Scrolls',
    slug: 'cardamom-scrolls',
    author: 'priya',
    daysAgo: 4,
    category: 'bakery',
    description:
      'Scandinavian rather than American: less icing, more spice, and cardamom ground fresh from the pods rather than shaken out of a jar.',
    prepTimeMinutes: 150,
    servings: 12,
    ingredients: [
      { name: 'plain flour', quantity: '500 g' },
      { name: 'milk', quantity: '250 ml, warm' },
      { name: 'butter', quantity: '100 g, softened' },
      { name: 'cardamom pods', quantity: '15, seeds ground' },
      { name: 'ground cinnamon', quantity: '2 tbsp' },
      { name: 'brown sugar', quantity: '120 g' },
      { name: 'instant yeast', quantity: '7 g' },
      { name: 'egg', quantity: '1, for glazing' },
    ],
    steps: [
      'Knead the dough with half the ground cardamom for 10 minutes and prove until doubled.',
      'Roll out, spread with butter creamed with brown sugar, cinnamon and the rest of the cardamom.',
      'Fold, cut into strips and twist each into a knot.',
      'Prove 45 minutes, glaze with egg, and bake at 200C for 15 minutes.',
    ],
    ratings: { mina: 5, dan: 4, tomas: 5 },
    comments: [
      { author: 'tomas', body: 'Grinding the cardamom fresh is a completely different smell to the pre-ground stuff.' },
      { author: 'dan', body: 'Twisting takes practice. Batch one looked terrible and tasted identical.' },
    ],
  },
  {
    title: 'Salted Caramel Banana Bread',
    slug: 'salted-caramel-banana-bread',
    author: 'tomas',
    daysAgo: 3,
    category: 'bakery',
    description:
      'For bananas that are past the point of being eaten out of hand. The caramel is swirled through rather than poured on top, so it stays molten in pockets.',
    prepTimeMinutes: 75,
    servings: 10,
    ingredients: [
      { name: 'bananas', quantity: '4, very ripe' },
      { name: 'plain flour', quantity: '250 g' },
      { name: 'butter', quantity: '120 g, melted' },
      { name: 'brown sugar', quantity: '150 g' },
      { name: 'eggs', quantity: '2' },
      { name: 'sea salt flakes', quantity: '1 tsp' },
      { name: 'baking soda', quantity: '1 tsp' },
    ],
    steps: [
      'Mash the bananas roughly, leaving some texture.',
      'Mix with the melted butter, sugar and eggs, then fold in the flour and baking soda.',
      'Make a quick caramel with 80 g of the sugar and a knob of butter, and swirl it through the batter with two passes of a knife.',
      'Bake at 170C for 55 minutes and test with a skewer in the centre.',
    ],
    ratings: { mina: 3, dan: 4, priya: 2, aisha: 3 },
    comments: [
      { author: 'priya', body: 'Mine came out too wet in the middle, I think my bananas were larger than intended.' },
      { author: 'dan', body: 'Good, though I would cut the caramel back a little next time.' },
    ],
  },
  {
    title: 'Blueberry Ricotta Galette',
    slug: 'blueberry-ricotta-galette',
    author: 'aisha',
    daysAgo: 1,
    category: 'bakery',
    description:
      'A tart for people who do not own a tart tin. Free-form pastry is far more forgiving, and the ricotta base stops the fruit soaking through.',
    prepTimeMinutes: 80,
    servings: 8,
    ingredients: [
      { name: 'plain flour', quantity: '200 g' },
      { name: 'butter', quantity: '120 g, very cold' },
      { name: 'ricotta', quantity: '200 g' },
      { name: 'blueberries', quantity: '350 g' },
      { name: 'lemon', quantity: '1, zest only' },
      { name: 'caster sugar', quantity: '60 g' },
      { name: 'egg', quantity: '1, for glazing' },
    ],
    steps: [
      'Rub the cold butter into the flour leaving visible flakes, bring together with iced water, and chill 30 minutes.',
      'Roll to a rough circle on baking paper. Ragged edges are the point.',
      'Spread the ricotta and lemon zest over the middle, then pile on the blueberries and sugar.',
      'Fold the border over in pleats, glaze, and bake at 200C for 40 minutes.',
    ],
    ratings: { mina: 5, dan: 4, priya: 5 },
    comments: [
      { author: 'mina', body: 'The ricotta layer solved the soggy bottom I get with every other galette.' },
      { author: 'priya', body: 'Worked with frozen blueberries, just needed ten extra minutes.' },
    ],
  },
];

const collections = [
  ['users', User],
  ['recipes', Recipe],
  ['comments', Comment],
  ['ratings', Rating],
];

const countExisting = async () => {
  const counts = {};
  for (const [label, Model] of collections) {
    counts[label] = await Model.estimatedDocumentCount();
  }
  return counts;
};

const seed = async () => {
  const force = process.argv.includes('--force');

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required but not set in the environment (server/.env)');
  }

  // Mirrors server/src/index.js: Node's resolver can default to 127.0.0.1 on
  // machines with VPN/virtual adapters and break the mongodb+srv:// SRV lookup.
  dns.setServers(['8.8.8.8', '1.1.1.1']);

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await countExisting();
  const total = Object.values(existing).reduce((sum, n) => sum + n, 0);

  if (total > 0 && !force) {
    const summary = Object.entries(existing)
      .map(([label, n]) => `${n} ${label}`)
      .join(', ');
    process.stderr.write(
      `\nRefusing to seed: the database is not empty (${summary}).\n` +
        'Re-run with "npm run seed -- --force" to DELETE all of the above and reseed.\n\n',
    );
    await mongoose.disconnect();
    process.exitCode = 1;
    return;
  }

  if (total > 0) {
    process.stdout.write('--force given: clearing users, recipes, comments and ratings...\n');
    for (const [, Model] of collections) {
      await Model.deleteMany({});
    }
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_COST);
  const createdUsers = await User.create(users.map((user) => ({ ...user, passwordHash })));
  const userByUsername = new Map(createdUsers.map((user) => [user.username, user]));
  process.stdout.write(`Created ${createdUsers.length} users.\n`);

  let commentCount = 0;
  let ratingCount = 0;

  for (const entry of recipes) {
    const recipe = await Recipe.create({
      title: entry.title,
      description: entry.description,
      category: entry.category,
      imageUrl: imageFor(entry.slug),
      prepTimeMinutes: entry.prepTimeMinutes,
      servings: entry.servings,
      ingredients: entry.ingredients,
      steps: entry.steps,
      author: userByUsername.get(entry.author)._id,
    });

    // `timestamps: true` overwrites any createdAt passed to create(), so the
    // backdating has to happen afterwards with timestamps off — the same escape
    // hatch the rating controller uses. Spreading createdAt is what makes
    // ?sort=new order differently from ?sort=top.
    const createdAt = new Date(Date.now() - entry.daysAgo * 24 * 60 * 60 * 1000);
    await Recipe.findByIdAndUpdate(
      recipe._id,
      { createdAt, updatedAt: createdAt },
      { timestamps: false },
    );

    for (const comment of entry.comments) {
      await Comment.create({
        recipeId: recipe._id,
        author: userByUsername.get(comment.author)._id,
        body: comment.body,
      });
      commentCount += 1;
    }

    // One rating per (recipeId, author) pair. The keys are usernames, so a
    // duplicate author within a recipe is impossible by construction and the
    // model's unique index is never violated.
    for (const [username, value] of Object.entries(entry.ratings)) {
      await Rating.findOneAndUpdate(
        { recipeId: recipe._id, author: userByUsername.get(username)._id },
        { $set: { value } },
        { upsert: true, new: true },
      );
      ratingCount += 1;
    }

    // The real endpoint's own recompute, not a hand-rolled average.
    await syncRecipeRating(recipe._id);
  }

  process.stdout.write(
    `Created ${recipes.length} recipes, ${commentCount} comments, ${ratingCount} ratings.\n`,
  );
  process.stdout.write(`\nLog in as any of: ${users.map((user) => user.email).join(', ')}\n`);
  process.stdout.write(`Password for all seeded users: ${DEMO_PASSWORD}\n\n`);

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  process.stderr.write(`Seed failed: ${err.message}\n`);
  await mongoose.disconnect().catch(() => {});
  process.exitCode = 1;
});
