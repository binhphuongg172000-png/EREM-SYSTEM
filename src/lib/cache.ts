type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const store = new Map<string, CacheEntry<any>>();

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 30
): Promise<T> {
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.expiry > now) {
    return existing.data;
  }

  const freshData = await fetcher();
  store.set(key, {
    data: freshData,
    expiry: now + ttlSeconds * 1000,
  });

  return freshData;
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.includes(pattern)) {
      store.delete(key);
    }
  }
}
