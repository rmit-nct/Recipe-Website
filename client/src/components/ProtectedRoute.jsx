import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-10 text-center text-navy">
        Loading...
      </p>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
