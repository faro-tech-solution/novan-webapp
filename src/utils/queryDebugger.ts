/**
 * Debug utilities for React Query to help identify unnecessary refetches
 */

import { QueryKey } from '@tanstack/react-query';

// Set to true to enable query debug logging
const ENABLE_QUERY_DEBUG = false;

// Log query events to the console
export const logQueryEvent = (
  event: 'fetch' | 'refetch' | 'stale' | 'invalidate',
  queryKey: QueryKey,
  reason?: string
) => {
  if (!ENABLE_QUERY_DEBUG) return;

  const timestamp = new Date().toISOString().split('T')[1];
  const keyString = JSON.stringify(queryKey);
  
  console.log(
    `%c[React Query Debug] ${timestamp} - ${event.toUpperCase()} - ${keyString}${reason ? ` - Reason: ${reason}` : ''}`, 
    'color: #9333ea; font-weight: bold;'
  );
};

// Helper to inject into queryFn for debugging
export const withQueryDebug = <T>(queryFn: () => Promise<T>, queryKey: QueryKey): (() => Promise<T>) => {
  return async () => {
    if (ENABLE_QUERY_DEBUG) {
      logQueryEvent('fetch', queryKey);
    }
    return await queryFn();
  };
};

// Observer to attach to a QueryClient
export const queryDebugObserver = {
  onSuccess: (_: unknown, query: any) => {
    if (ENABLE_QUERY_DEBUG) {
      logQueryEvent('fetch', query.queryKey, 'success');
    }
  },
  onError: (error: unknown, query: any) => {
    if (ENABLE_QUERY_DEBUG) {
      logQueryEvent('fetch', query.queryKey, `error: ${error}`);
    }
  },
  onSettled: (_: unknown, __: unknown, query: any) => {
    if (ENABLE_QUERY_DEBUG) {
      logQueryEvent('fetch', query.queryKey, 'settled');
    }
  }
};
