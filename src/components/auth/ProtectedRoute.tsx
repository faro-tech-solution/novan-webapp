'use client';

import { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { getDashboardPathForRole } from '@/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login and preserve intended destination
      if (!profile) {
        const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        router.push(`/?from=${encodeURIComponent(currentPath)}`);
        return;
      }

      // If a specific role is required and user doesn't have it, redirect to their correct dashboard
      if (requiredRole && profile.role !== requiredRole) {
        router.push(getDashboardPathForRole(profile.role));
        return;
      }
    }
  }, [profile, loading, router, requiredRole, pathname, searchParams]);

  // Show loading while checking authentication
  if (loading) {
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
  if (!profile) {
    return null;
  }

  // If role is required and doesn't match, don't render children (will redirect)
  if (requiredRole && profile.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
