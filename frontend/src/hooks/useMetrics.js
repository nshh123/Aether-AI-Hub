/**
 * useMetrics.js
 * Custom React hook that fetches and polls the /api/metrics/dashboard endpoint.
 * Returns: { data, loading, error, refetch }
 */

import { useCallback, useEffect, useRef, useState } from "react";

const POLL_INTERVAL_MS = 30_000; // refresh every 30 seconds

export function useMetrics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/metrics/dashboard");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message ?? "Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
