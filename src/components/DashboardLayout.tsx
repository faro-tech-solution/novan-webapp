import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  Award
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const trainerNavItems = [
    { href: '/dashboard/trainer', icon: LayoutDashboard, label: 'داشبورد' },
    { href: '/courses-management', icon: Users, label: 'درس‌ها' },
    { href: '/exercises', icon: FileText, label: 'تمرین‌ها' },
    { href: '/students', icon: Award, label: 'دانشجویان' },
  ];

  const traineeNavItems = [
    { href: '/dashboard/trainee', icon: LayoutDashboard, label: 'داشبورد' },
    { href: '/my-exercises', icon: FileText, label: 'تمرین‌های من' },
    { href: '/progress', icon: Award, label: 'پیشرفت' },
    { href: '/student-courses', icon: BookOpen, label: 'دوره‌های من' },
  ];

  const adminNavItems = [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'داشبورد' },
    { href: '/courses-management', icon: Users, label: 'مدیریت درس‌ها' },
    { href: '/students', icon: Award, label: 'دانشجویان' },
    { href: '/exercises', icon: FileText, label: 'تمرین‌ها' },
  ];

  const getNavItems = () => {
    switch (profile?.role) {
      case 'trainer':
        return trainerNavItems;
      case 'trainee':
        return traineeNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return traineeNavItems;
    }
  };

  const navItems = getNavItems();

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'trainer':
        return 'مربی';
      case 'trainee':
        return 'دانشجو';
      case 'admin':
        return 'مدیر';
      default:
        return 'کاربر';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link to="/" className="flex items-center space-x-2 space-x-reverse">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">آ</span>
              </div>
              <span className="text-xl font-bold text-gray-900 font-peyda">آموزش‌هاب</span>
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-lg font-semibold text-gray-900 font-peyda">{title}</h1>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="text-sm text-gray-700">
                {profile?.name} ({getRoleLabel(profile?.role)})
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 ml-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-[200px] bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex items-center space-x-3 space-x-reverse px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
