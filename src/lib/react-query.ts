import { QueryClient } from '@tanstack/react-query';

// Configure React Query with reduced caching to ensure data freshness
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,              // Data immediately becomes stale
      gcTime: 5 * 60 * 1000,     // Keep unused data in cache for 5 minutes
      retry: 1,                  // Only retry failed queries once
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: true,       // Refetch when component mounts
      refetchOnReconnect: true,   // Refetch when reconnecting network
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

// Use this function to customize query options when needed
export const getQueryOptions = (customOptions = {}) => ({
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  ...customOptions
});