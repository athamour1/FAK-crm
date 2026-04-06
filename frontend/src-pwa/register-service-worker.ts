import { register } from 'register-service-worker';

register(process.env.SERVICE_WORKER_FILE, {
  updated () {
    // New version available — reload once the user acknowledges
    // Quasar's Notify plugin isn't available here (outside Vue),
    // so we use a simple confirm. A nicer in-app banner can be added later.
    if (confirm('A new version of FAK-CRM is available. Reload to update?')) {
      window.location.reload();
    }
  },

  offline () {
    console.warn('[FAK-CRM] Running offline — some features may be unavailable.');
  },

  error (err) {
    console.error('[FAK-CRM] Service worker error:', err);
  },
});
