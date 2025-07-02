# React Query Refetch Issue Fix

## Problem

The application was experiencing unnecessary API refetching when switching browser tabs and returning to the application. This was happening across all pages but was most noticeable on the `/exercises` page.

## Root Cause Analysis

The issue was caused by several factors:

1. **Auth State Fluctuations**: Supabase's `onAuthStateChange` listener was triggering during tab switches, causing temporary user state changes (user → null → user)
2. **Query Dependency on Unstable User State**: All queries using `enabled: !!user` were refetching whenever the user state flickered
3. **Insufficient Stale Time**: Short stale times caused queries to refetch even when data was still fresh
4. **Missing Initialization Guard**: No protection against premature query execution during app initialization

## Solution Implementation

### 1. Enhanced Auth Context (`/src/contexts/AuthContext.tsx`)

- Added `isInitialized` state to track when auth setup is complete
- Improved auth state change handling to prevent unnecessary user state updates
- Added protection against token refresh events that don't require user state changes

### 2. Stable Auth Hook (`/src/hooks/useStableAuth.ts`)

- Created a custom hook that provides stable auth state references
- Uses `useMemo` to prevent unnecessary re-renders
- Provides `isQueryEnabled` flag that combines all necessary conditions

### 3. Enhanced React Query Configuration (`/src/lib/react-query.ts`)

- Increased `staleTime` to 15 minutes (was 5 minutes)
- Increased `gcTime` to 30 minutes (was 10 minutes)
- Added comprehensive refetch prevention:
  - `refetchOnWindowFocus: false`
  - `refetchOnMount: false`
  - `refetchOnReconnect: false`
  - `refetchInterval: false`
  - `refetchIntervalInBackground: false`
- Added development-mode debugging for query events

### 4. Updated Query Hooks

Updated all user-dependent query hooks to use:

- `useStableAuth()` instead of `useAuth()`
- `enabled: isQueryEnabled` instead of `enabled: !!user`

**Updated hooks:**

- `/src/hooks/queries/useExercisesQuery.ts`
- `/src/hooks/queries/useMyExercisesQuery.ts`
- `/src/hooks/queries/useReviewSubmissionsQuery.ts`

### 5. Debug Utilities (`/src/utils/queryDebugger.ts`)

- Created debugging tools to help identify refetch issues in the future
- Can be enabled by setting `ENABLE_QUERY_DEBUG = true`
- Provides detailed logging of query events with timestamps

## Configuration Settings

### React Query Settings

```typescript
staleTime: 15 * 60 * 1000,           // 15 minutes
gcTime: 30 * 60 * 1000,              // 30 minutes
refetchOnWindowFocus: false,          // No refetch on tab switch
refetchOnMount: false,                // No refetch on component mount
refetchOnReconnect: false,            // No refetch on network reconnect
refetchInterval: false,               // No periodic refetching
refetchIntervalInBackground: false,   // No background refetching
```

### Auth State Management

```typescript
enabled: isQueryEnabled; // Combines: isInitialized && !loading && !!user && !!userId
```

## Testing the Fix

1. **Tab Switching Test**:

   - Navigate to `/exercises` page
   - Switch to another browser tab
   - Wait 5-10 seconds
   - Switch back to the application
   - Verify no API calls are made (check Network tab)

2. **Fresh Data Test**:

   - Perform actions that modify data (create/edit/delete exercise)
   - Verify that data updates correctly
   - Check that only necessary API calls are made

3. **Authentication Test**:
   - Log out and log back in
   - Verify queries work correctly after authentication
   - Check that no duplicate queries are executed

## Debugging

To enable debugging for investigation:

1. Set `ENABLE_QUERY_DEBUG = true` in `/src/utils/queryDebugger.ts`
2. Open browser console
3. Look for colored log messages showing query events
4. Monitor when queries are being triggered and why

## Performance Impact

Expected improvements:

- 70-90% reduction in unnecessary API calls
- Faster page navigation due to cached data
- Reduced server load
- Better user experience with no loading flickering

## Monitoring

Watch for these metrics:

- Network requests when switching tabs (should be minimal)
- Page load times (should improve)
- User experience smoothness (no loading states on tab return)
- Server response times (should improve due to reduced load)

## Future Maintenance

- Monitor the 15-minute stale time - adjust if data needs to be fresher
- Consider implementing selective refetch for critical data
- Add more specific query invalidation strategies for data mutations
- Consider implementing optimistic updates for better UX
