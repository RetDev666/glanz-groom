/**
 * Tiny in-memory TTL cache for hot public GET endpoints.
 * Safe on Netlify Functions (per-instance); invalidates on writes.
 */

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/** Delete one key or all keys with a prefix (e.g. "settings"). */
export function cacheInvalidate(keyOrPrefix: string): void {
  if (store.has(keyOrPrefix)) {
    store.delete(keyOrPrefix);
  }
  for (const key of store.keys()) {
    if (key.startsWith(keyOrPrefix)) store.delete(key);
  }
}

export function cacheClear(): void {
  store.clear();
}

/** Common TTLs (ms) */
export const TTL = {
  SHORT: 10_000,       // ~10s — semi-live (availability)
  MEDIUM: 30_000,      // 30s — services, groomers, settings
  LONG: 60_000,        // 60s — reviews, portfolio, offers
} as const;
