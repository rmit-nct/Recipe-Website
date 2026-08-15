// All fetch() calls for the recipes domain live here — components call
// these functions instead of calling fetch() directly.

export async function getRecipes() {
  const response = await fetch('/api/recipes');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const { data } = await response.json();
  return data.recipes;
}
