import { QueryClient } from '@tanstack/react-query';

// Configure React Query with reduced caching to ensure data freshness
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh but avoid jitter on focus/mount that causes media remounts
      staleTime: 15 * 60 * 1000,           // 15 minutes
      gcTime: 30 * 60 * 1000,              // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add debugging for development
if (process.env.NODE_ENV === 'development') {
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'added' || event.type === 'updated') {
      console.log(`%c[React Query] ${event.type.toUpperCase()}`, 'color: #10b981; font-weight: bold;', {
        queryKey: event.query.queryKey,
        state: event.query.state.status,
        fetchStatus: event.query.state.fetchStatus,
        dataUpdatedAt: new Date(event.query.state.dataUpdatedAt).toLocaleTimeString(),
      });
    }
  });
}

// Helper to customize per-query options when truly needed
export const getQueryOptions = (customOptions = {}) => ({
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  refetchInterval: false,
  refetchIntervalInBackground: false,
  ...customOptions,
});