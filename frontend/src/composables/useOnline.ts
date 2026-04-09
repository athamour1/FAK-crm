import { ref, readonly } from 'vue';

// Module-level singleton — listeners registered once, shared across all consumers
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);

if (typeof window !== 'undefined') {
  window.addEventListener('online',  () => { isOnline.value = true; });
  window.addEventListener('offline', () => { isOnline.value = false; });
}

export function useOnline() {
  return { isOnline: readonly(isOnline) };
}
