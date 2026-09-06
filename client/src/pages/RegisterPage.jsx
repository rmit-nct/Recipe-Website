import { Link } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm.jsx';

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-burnt-orange md:text-xs">
        Join the kitchen
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
        Create an account
      </h1>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-navy/70">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-steel-blue hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
