import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { showToast } from '../../lib/toastStore.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @typedef {import('../../api/auth').ApiError} ApiError */

export default function LoginForm() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }
    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      showToast('Logged in, welcome back!');
      navigate('/recipes');
    } catch (err) {
      const apiError = /** @type {ApiError} */ (err);
      setFormError(apiError.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {formError && (
        <p className="rounded-2xl border border-burnt-orange/25 bg-gold-light px-4 py-3 text-sm text-navy">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="font-mono text-xs uppercase tracking-[0.08em] text-navy/70">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-navy/15 bg-cream-base px-4 py-2.5 text-navy placeholder:text-navy/40 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue/30"
          placeholder="you@example.com"
        />
        {fieldErrors.email && <p className="text-sm text-burnt-orange">{fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="font-mono text-xs uppercase tracking-[0.08em] text-navy/70">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-navy/15 bg-cream-base px-4 py-2.5 text-navy placeholder:text-navy/40 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue/30"
          placeholder="••••••••"
        />
        {fieldErrors.password && <p className="text-sm text-burnt-orange">{fieldErrors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-navy px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
