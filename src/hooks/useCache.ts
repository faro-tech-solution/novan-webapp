import { useState, useEffect, useRef } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

export function useCache<T>(key: string, fetchFn: () => Promise<T>, options: CacheOptions = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheItem<T>>>(new Map());
  const { ttl = 5 * 60 * 1000 } = options; // Default 5 minutes TTL

  const fetchData = async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      const cachedItem = cacheRef.current.get(key);
      const now = Date.now();

      if (!force && cachedItem && (now - cachedItem.timestamp) < ttl) {
        setData(cachedItem.data);
        setLoading(false);
        return;
      }

      const result = await fetchFn();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const invalidate = () => {
    cacheRef.current.delete(key);
  };

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate
  };
} 