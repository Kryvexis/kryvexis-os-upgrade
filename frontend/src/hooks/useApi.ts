import { useEffect, useState } from 'react';

export function useApi<T>(path: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '/api';

    fetch(`${baseUrl}${path}`)
      .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch')))
      .then((json) => {
        if (mounted) setData(json as T);
      })
      .catch(() => {
        if (mounted) setData(fallback);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [fallback, path]);

  return { data, loading };
}
