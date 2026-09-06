import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm.jsx';

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
        Welcome back
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
        Log in
      </h1>

      <div className="mt-8">
        <LoginForm />
      </div>

      <p className="mt-6 text-sm text-navy/70">
        New to Neo Recipe?{' '}
        <Link to="/register" className="font-semibold text-steel-blue hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
