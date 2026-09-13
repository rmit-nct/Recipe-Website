import { useEffect, useState } from 'react';
import logo from '../assets/logo.png';
import { dismissToast } from '../lib/toastStore.js';
import { useToasts } from '../hooks/useToasts.js';

// Cooking-theme toast: same brand logo mark as the nav bar and footer
// instead of a generic check/x icon, a burnt-orange "seed dot" per
// docs/DESIGN_SYSTEM.md's micro-decoration motif, gold (success) vs
// burnt-orange (error) as the one variant color.
function Toast({ id, message, variant }) {
  const [isShown, setIsShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const accent = variant === 'error' ? 'border-burnt-orange/40' : 'border-gold/50';
  const dot = variant === 'error' ? 'bg-burnt-orange' : 'bg-amber';

  return (
    <div
      role="status"
      className={`flex items-center gap-3 rounded-2xl border ${accent} bg-navy px-4 py-3 text-cream-base shadow-lg transition duration-300 ease-out ${
        isShown ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-cream-base/10">
        <img src={logo} alt="" className="h-5 w-5 object-contain" />
      </span>

      <p className="flex-1 text-sm leading-snug">{message}</p>

      <span className={`h-1.5 w-1.5 flex-none rounded-full ${dot}`} aria-hidden="true" />

      <button
        type="button"
        onClick={() => dismissToast(id)}
        aria-label="Dismiss notification"
        className="flex-none font-mono text-xs uppercase tracking-[0.08em] text-cream-base/60 transition hover:text-cream-base"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <Toast {...toast} />
        </div>
      ))}
    </div>
  );
}
