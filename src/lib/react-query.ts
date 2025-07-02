import { QueryClient } from '@tanstack/react-query';

// Configure React Query globally to prevent unnecessary refetches
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes - data considered fresh for longer
      gcTime: 30 * 60 * 1000,    // 30 minutes - cached data kept longer
      retry: 1,                  // Only retry failed queries once
      refetchOnWindowFocus: false,   // Don't refetch when window regains focus
      refetchOnMount: false,         // Don't refetch when component mounts
      refetchOnReconnect: false,     // Don't refetch when reconnecting network
      refetchInterval: false,        // Disable interval refetching
      refetchIntervalInBackground: false, // Disable background interval refetching
    },
    mutations: {
      retry: 1,
    },
  },
});

// Add debugging for development
if (import.meta.env.DEV) {
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
  staleTime: 15 * 60 * 1000,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  ...customOptions
});