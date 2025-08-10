'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPathForRole } from '@/utils';

const Dashboard = () => {
  const { profile, loading, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized || loading) return;

    if (!loading) {
      if (!profile) {
        router.replace('/portal/login');
        return;
      }

      // Redirect based on user role
      router.replace(getDashboardPathForRole(profile.role));
    }
  }, [profile, loading, isInitialized, router]);

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

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">انتقال به داشبورد...</p>
      </div>
    </div>
  );
};

export default Dashboard;
