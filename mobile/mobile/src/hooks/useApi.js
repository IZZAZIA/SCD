import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Loads data whenever the screen gains focus, so lists are fresh after every edit.
export default function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fetcherRef.current());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  return { data, loading, error, reload: load };
}
