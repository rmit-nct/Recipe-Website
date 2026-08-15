import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Recipes from './pages/Recipes';

export default function App() {
  return (
    <BrowserRouter>
      {/* Navigation Links */}
      <nav style={{ padding: '1rem', backgroundColor: '#eee' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/recipes">Recipes</Link>
      </nav>

      {/* The actual pages that swap out */}
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
