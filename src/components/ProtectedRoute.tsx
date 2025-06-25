
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'trainer' | 'trainee' | 'admin';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // If user is not authenticated, redirect to login
      if (!profile) {
        navigate('/');
        return;
      }

      // If a specific role is required and user doesn't have it, redirect to their correct dashboard
      if (requiredRole && profile.role !== requiredRole) {
        if (profile.role === 'trainer') {
          navigate('/dashboard/trainer');
        } else if (profile.role === 'trainee') {
          navigate('/dashboard/trainee');
        } else if (profile.role === 'admin') {
          navigate('/dashboard/admin');
        }
        return;
      }
    }
  }, [profile, loading, navigate, requiredRole]);

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
