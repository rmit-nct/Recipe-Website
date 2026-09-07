import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

/**
 * Calls POST /api/auth/logout (via AuthContext.logout), clears the local
 * user, and navigates to "/". Renders nothing when logged out.
 *
 * On a public page (e.g. Home) this is the redirect the user actually
 * lands on. On a page under ProtectedRoute, clearing `user` also makes
 * ProtectedRoute's own guard redirect to /login — since that state update
 * and this navigate() call race, /login can win instead, which is fine:
 * both destinations are valid post-logout landing spots, not a bug.
 *
 * AuthContext.logout() clears `user` in its own `finally` regardless of
 * whether the network call itself succeeds, so a failed request still logs
 * the user out client-side — we still surface the failure rather than
 * hiding it, per CLAUDE.md §8 (every fetch outcome gets a visible state,
 * not just a silent catch).
 */
export default function LogoutButton() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  async function handleLogout() {
    setIsLoggingOut(true);
    setError('');

    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Logged out, but the server request failed.');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="ml-auto flex items-center gap-3">
      {error ? <span className="font-mono text-[11px] text-burnt-orange/90">{error}</span> : null}
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.08em] text-cream-base/80 transition hover:bg-cream-base/10 hover:text-cream-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? 'Logging out…' : 'Log out'}
      </button>
    </div>
  );
}
