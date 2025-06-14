
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!profile) {
        navigate('/login');
        return;
      }

      // Redirect based on user role
      if (profile.role === 'trainer') {
        navigate('/dashboard/trainer');
      } else if (profile.role === 'trainee') {
        navigate('/dashboard/trainee');
      }
    }
  }, [profile, loading, navigate]);

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
