// Plain pub-sub singleton, not React Context — CLAUDE.md §8 reserves
// useContext for AuthContext only, so toasts are broadcast from anywhere
// (forms, buttons, pages) through subscribe/getSnapshot instead, read via
// useSyncExternalStore in useToasts.js.

let toasts = [];
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return toasts;
}

/**
 * @param {string} message
 * @param {{ variant?: 'success'|'error' }} [options]
 */
export function showToast(message, { variant = 'success' } = {}) {
  const id = Date.now() + Math.random();
  toasts = [...toasts, { id, message, variant }];
  emit();

  setTimeout(() => dismissToast(id), 4000);
}

export function dismissToast(id) {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}
