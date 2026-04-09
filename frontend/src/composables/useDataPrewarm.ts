/**
 * Background cache pre-warmer.
 *
 * Fetches all GET endpoints that have Workbox runtime-caching rules so they
 * are available offline without the user having to visit every page manually.
 *
 * Call `prewarmCache(isAdmin)` whenever:
 *   - the app mounts while online
 *   - the tab becomes visible again (visibilitychange)
 *   - the device comes back online
 *
 * A module-level lock prevents concurrent runs.
 */

let warming = false;

export async function prewarmCache(isAdmin: boolean): Promise<void> {
  if (warming) return;
  warming = true;

  try {
    // Dynamic import avoids circular-dependency issues at module load time
    const { kitsApi, usersApi, inspectionsApi, incidentsApi, alertsApi } =
      await import('src/services/api');

    if (isAdmin) {
      // Fetch the kit list first, then all kit details in parallel
      const { data: kits } = await kitsApi.list();

      await Promise.allSettled([
        ...kits.map((k) => kitsApi.get(k.id)),
        usersApi.list(),
        inspectionsApi.list(),
        incidentsApi.list(),
        alertsApi.summary(),
        alertsApi.expiring(),
      ]);
    } else {
      // Checkers only see their own kits
      const { data: kits } = await kitsApi.myKits();

      await Promise.allSettled([
        ...kits.map((k) => kitsApi.get(k.id)),
        inspectionsApi.list(),
        incidentsApi.list(),
      ]);
    }
  } catch {
    // Silently swallow — this is a best-effort background operation.
    // Individual failures are already handled by Promise.allSettled above;
    // this catch covers the initial list() call failing (e.g. already offline).
  } finally {
    warming = false;
  }
}
