import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import LogoutButton from './features/auth/LogoutButton.jsx';
import Footer from './components/Footer.jsx';
import logo from './assets/logo.png';

const navLinkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] transition',
    isActive
      ? 'bg-gold text-navy'
      : 'text-cream-base/80 hover:bg-cream-base/10 hover:text-cream-base',
  ].join(' ');

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <header className="bg-navy">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
            <Link to="/" className="flex items-center gap-2.5 text-cream-base transition hover:opacity-90">
              <img src={logo} alt="" className="h-9 w-9 object-contain" />
              <span className="font-display text-lg font-semibold text-cream-base">
                Neo Recipe
              </span>
            </Link>

            <div className="flex items-center gap-1">
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>
              <NavLink to="/recipes" className={navLinkClass}>
                Recipes
              </NavLink>
            </div>

            <LogoutButton />
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/new" element={<CreateRecipePage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              <Route path="/recipes/:id/edit" element={<EditRecipePage />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
