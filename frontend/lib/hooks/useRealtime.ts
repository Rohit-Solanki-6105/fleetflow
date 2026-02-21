// Real-time Updates Hook
import { useEffect, useRef, useState } from 'react';

interface UseRealtimeOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onUpdate?: () => void;
}

/**
 * Hook for real-time data updates
 * Polls the API at regular intervals to fetch fresh data
 */
export function useRealtime<T>(
  fetchFn: () => Promise<T>,
  options: UseRealtimeOptions = {}
) {
  const {
    enabled = true,
    interval = 10000, // Default: 10 seconds
    onUpdate
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const fetchRef = useRef(fetchFn);
  const onUpdateRef = useRef(onUpdate);

  // Update refs when functions change
  useEffect(() => {
    fetchRef.current = fetchFn;
    onUpdateRef.current = onUpdate;
  }, [fetchFn, onUpdate]);

  // Fetch data function
  const fetchData = async () => {
    try {
      const result = await fetchRef.current();
      setData(result);
      setError(null);
      setLastUpdate(new Date());
      onUpdateRef.current?.();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchData();

    // Set up polling
    const intervalId = setInterval(fetchData, interval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, interval]);

  // Manual refresh
  const refresh = () => {
    setLoading(true);
    fetchData();
  };

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh
  };
}

/**
 * Hook for monitoring specific resource status changes
 */
export function useStatusMonitor(
  resourceType: 'vehicle' | 'driver' | 'trip',
  resourceId: string | number,
  fetchFn: () => Promise<any>,
  options: UseRealtimeOptions = {}
) {
  const [status, setStatus] = useState<string | null>(null);
  const [statusChanged, setStatusChanged] = useState(false);
  
  const { data, ...rest } = useRealtime(fetchFn, options);

  useEffect(() => {
    if (data) {
      const newStatus = (data as any).status;
      if (status && newStatus !== status) {
        setStatusChanged(true);
        setTimeout(() => setStatusChanged(false), 3000); // Reset after 3s
      }
      setStatus(newStatus);
    }
  }, [data, status]);

  return {
    data,
    status,
    statusChanged,
    ...rest
  };
}

/**
 * Hook for dashboard real-time metrics
 */
export function useDashboardMetrics(enabled = true) {
  return useRealtime(
    async () => {
      // Fetch dashboard metrics
      const response = await fetch('/api/analytics/dashboard/');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    },
    { enabled, interval: 5000 } // Update every 5 seconds
  );
}
