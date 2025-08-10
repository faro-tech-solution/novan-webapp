'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { getDashboardPathForRole } from '@/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { profile, user, isInitialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Compute the "from" location once to avoid effect churn caused by unstable searchParams object
  const fromLocation = useMemo(() => {
    const qs = searchParams?.toString();
    return pathname + (qs ? `?${qs}` : "");
  }, [pathname]);

  useEffect(() => {
    if (!isInitialized) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProtectedRoute] waiting init', { isInitialized, pathname: fromLocation });
      }
      return;
    }

    // Wait for auth to initialize. If no user after init, redirect.
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProtectedRoute] no user, redirecting to login', { fromLocation });
      }
      router.replace(`/portal/login?from=${encodeURIComponent(fromLocation)}`);
      return;
    }

    // If profile still missing after init but user exists, stay while profile loads
    if (!profile) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProtectedRoute] user exists but profile not loaded yet');
      }
      return;
    }

    // Enforce role if required
    if (requiredRole && profile.role !== requiredRole) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ProtectedRoute] role mismatch, redirecting', { requiredRole, actual: profile.role });
      }
      router.replace(getDashboardPathForRole(profile.role));
      return;
    }
  }, [isInitialized, user, profile, router, requiredRole, fromLocation]);

  // Show loading while checking authentication
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!user) {
    return null;
  }

  // If user exists but profile not loaded yet, hold rendering
  if (!profile) {
    return null;
  }

  // If role is required and doesn't match, don't render children (will redirect)
  if (requiredRole && profile && profile.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
