import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

/**
 * Hook to provide stable authentication state for React Query
 * Prevents unnecessary refetches caused by auth state changes during tab switches
 */
export const useStableAuth = () => {
  const { user, profile, isInitialized, loading } = useAuth();
  
  // Create stable references to prevent unnecessary re-renders and refetches
  const stableUserId = useMemo(() => user?.id || null, [user?.id]);
  const stableUserEmail = useMemo(() => user?.email || null, [user?.email]);
  const stableProfileId = useMemo(() => profile?.id || null, [profile?.id]);
  const stableRole = useMemo(() => profile?.role || null, [profile?.role]);
  
  // Only enable queries when auth is fully initialized and we have a user
  const isQueryEnabled = useMemo(() => {
    return isInitialized && !loading && !!user && !!stableUserId;
  }, [isInitialized, loading, user, stableUserId]);
  
  return {
    user,
    profile,
    userId: stableUserId,
    userEmail: stableUserEmail,
    profileId: stableProfileId,
    role: stableRole,
    isInitialized,
    loading,
    isQueryEnabled,
  };
};
