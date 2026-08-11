import { useEffect } from 'react';

export default function Recipes() {
  // useEffect tells React to run this code as soon as the page loads on the screen
  useEffect(() => {
    const fetchFakeRecipes = async () => {
      try {
        // The Vite proxy will catch this and forward it to the backend
        const response = await fetch('/api/recipes');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Success! Fetched fake recipes:", data);
      } catch (error) {
        // Handling the failure case!
        console.error("Fetch failed. Is the backend running?", error);
      }
    };

    fetchFakeRecipes();
  }, []); 

  return (
    <div>
      <h1>Recipes Page</h1>
      <p>Check your browser console (F12) to see the fake data!</p>
    </div>
  );
}