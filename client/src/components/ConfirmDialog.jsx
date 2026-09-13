import { useEffect } from 'react';
import logo from '../assets/logo.png';

/**
 * Themed modal confirmation, replacing window.confirm — same navy/cream/gold
 * surface language as the rest of the app (docs/DESIGN_SYSTEM.md) instead of
 * the browser's native dialog.
 *
 * @param {{
 *   open: boolean,
 *   title: string,
 *   message: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   isConfirming?: boolean,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Dismiss dialog"
        onClick={onCancel}
        className="absolute inset-0 bg-navy/50 backdrop-blur-[1px]"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="relative w-full max-w-sm rounded-3xl border border-navy/10 bg-cream-base p-6 shadow-xl"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gold-light">
            <img src={logo} alt="" className="h-6 w-6 object-contain" />
          </span>
          <h2 id="confirm-dialog-title" className="font-display text-lg font-semibold text-navy">
            {title}
          </h2>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-navy/70">{message}</p>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="inline-flex items-center justify-center rounded-full border border-navy/15 bg-cream-base px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-navy transition hover:border-steel-blue disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirming}
            className="inline-flex items-center justify-center rounded-full bg-burnt-orange px-5 py-2.5 font-mono text-xs uppercase tracking-[0.08em] text-cream-base transition hover:bg-burnt-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConfirming ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
