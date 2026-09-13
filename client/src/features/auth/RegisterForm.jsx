import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { showToast } from '../../lib/toastStore.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

/** @typedef {import('../../api/auth').ApiError} ApiError */

export default function RegisterForm() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
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
      await register({ username: username.trim(), email: email.trim(), password });
      showToast('Account created, welcome to Neo Recipe!');
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
        <label htmlFor="register-username" className="font-mono text-xs uppercase tracking-[0.08em] text-navy/70">
          Username
        </label>
        <input
          id="register-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="rounded-xl border border-navy/15 bg-cream-base px-4 py-2.5 text-navy placeholder:text-navy/40 focus:border-steel-blue focus:outline-none focus:ring-2 focus:ring-steel-blue/30"
          placeholder="chef_khanh"
        />
        {fieldErrors.username && <p className="text-sm text-burnt-orange">{fieldErrors.username}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-email" className="font-mono text-xs uppercase tracking-[0.08em] text-navy/70">
          Email
        </label>
        <input
          id="register-email"
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
        <label htmlFor="register-password" className="font-mono text-xs uppercase tracking-[0.08em] text-navy/70">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
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
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
}
