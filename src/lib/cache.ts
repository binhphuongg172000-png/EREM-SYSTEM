import { unstable_cache } from "next/cache";

// In-memory store for ultra-fast repeat hits within same process
type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const memStore = new Map<string, CacheEntry<any>>();

// Registry to track invalidation tags
const keyToTags = new Map<string, string[]>();

/**
 * Two-tier cache:
 * 1. In-memory (memStore): Sub-millisecond, works within the same invocation/process
 * 2. Next.js unstable_cache: Persists across serverless invocations (works on Vercel)
 */
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 30,
  tags?: string[]
): Promise<T> {
  const now = Date.now();
  const existing = memStore.get(key);

  // Hit in-memory cache first (fastest)
  if (existing && existing.expiry > now) {
    return existing.data as T;
  }

  // Use Next.js cache for cross-invocation persistence
  const cacheTags = tags || [key.split("_")[0] || "data"];
  keyToTags.set(key, cacheTags);

  const cachedFetcher = unstable_cache(
    fetcher,
    [key],
    {
      revalidate: ttlSeconds,
      tags: cacheTags,
    }
  );

  const freshData = await cachedFetcher();

  // Also store in memory for repeat hits in this invocation
  memStore.set(key, {
    data: freshData,
    expiry: now + Math.min(ttlSeconds, 30) * 1000,
  });

  return freshData;
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

