import { useSyncExternalStore } from 'react';
import { subscribe, getSnapshot } from '../lib/toastStore.js';

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
