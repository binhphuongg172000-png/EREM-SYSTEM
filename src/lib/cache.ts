import { revalidatePath } from "next/cache";

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

// Global in-memory store across requests within the process
const memStore = new Map<string, CacheEntry<any>>();

/**
 * High-performance 2-tier cache wrapper:
 * 1. Global in-memory store (sub-millisecond instant hit)
 * 2. Automatic TTL revalidation (defaults to 60s)
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 60,
  tags?: string[]
): Promise<T> {
  const now = Date.now();
  const existing = memStore.get(key);

  // Return instantly from memory if valid
  if (existing && existing.expiry > now) {
    return existing.data as T;
  }

  // Fetch fresh data
  try {
    const freshData = await fetcher();
    memStore.set(key, {
      data: freshData,
      expiry: now + ttlSeconds * 1000,
    });
    return freshData;
  } catch (err) {
    // Fail-safe: if fetch fails, return stale data if available
    if (existing) {
      return existing.data as T;
    }
    throw err;
  }
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    memStore.clear();
    return;
  }
  for (const key of memStore.keys()) {
    if (key.includes(pattern)) {
      memStore.delete(key);
    }
  }
}
