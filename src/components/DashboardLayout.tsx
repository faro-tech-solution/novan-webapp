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
  Award,
  UserCog,
  CheckCircle,
  Wallet,
  Menu,
  Home,
  GraduationCap,
  CheckSquare,
  TrendingUp,
  User,
  Edit
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useSubmissionsQuery } from '@/hooks/useReviewSubmissionsQuery';
import { Badge } from '@/components/ui/badge';

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
    { href: '/review-submissions', icon: CheckCircle, label: 'بررسی تمرین‌ها' },
    { href: '/students', icon: Award, label: 'دانشجویان' },
    { href: '/wiki/manage', icon: Edit, label: 'مدیریت ویکی' },
    { href: '/profile', icon: UserCog, label: 'پروفایل' },
  ];

  const traineeNavItems = [
    { href: '/dashboard/trainee', icon: LayoutDashboard, label: 'داشبورد' },
    { href: '/my-exercises', icon: FileText, label: 'تمرین‌های من' },
    { href: '/progress', icon: Award, label: 'پیشرفت' },
    { href: '/student-courses', icon: BookOpen, label: 'دوره‌های من' },
    { href: '/profile', icon: UserCog, label: 'پروفایل' },
    { href: '/wiki', icon: BookOpen, label: 'ویکی' },
  ];

  const adminNavItems = [
    { href: '/dashboard/admin', icon: LayoutDashboard, label: 'داشبورد' },
    { href: '/user-management', icon: UserCog, label: 'مدیریت کاربران' },
    { href: '/courses-management', icon: Users, label: 'مدیریت درس‌ها' },
    { href: '/students', icon: Award, label: 'دانشجویان' },
    { href: '/exercises', icon: FileText, label: 'تمرین‌ها' },
    { href: '/review-submissions', icon: CheckCircle, label: 'بررسی تمرین‌ها' },
    { href: '/accounting', icon: Wallet, label: 'حسابداری' },
    { href: '/wiki/manage', icon: Edit, label: 'مدیریت ویکی' },
    { href: '/profile', icon: UserCog, label: 'پروفایل' },
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

  const { data: submissions = [] } = useSubmissionsQuery();
  const pendingReviewCount = submissions.filter(s => s.score === null).length;

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">آ</span>
                </div>
                <span className="text-xl font-bold text-gray-900 font-peyda">پرتال آموزش فاروباکس</span>
              </Link>
              <span className="text-gray-400 hidden md:inline">|</span>
              <h1 className="text-lg font-semibold text-gray-900 font-peyda hidden md:block">{title}</h1>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-700">
                  {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'کاربر'} ({getRoleLabel(profile?.role)})
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 ml-2" />
                  خروج
                </Button>
              </div>
              <SidebarTrigger className="md:hidden" />
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-theme(space.20))]">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 bg-white border-l">
            <div className="h-full py-4">
              <div className="px-4 mb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 relative"
                  >
                    <item.icon className="h-5 w-5 ml-3" />
                    <span>{item.label}</span>
                    {item.href === '/review-submissions' && pendingReviewCount > 0 && (
                      <Badge className="absolute left-2 top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {pendingReviewCount}
                      </Badge>
                    )}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5 ml-3" />
                  <span>خروج</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className="md:hidden">
            <Sidebar variant="inset" collapsible="icon">
              <SidebarHeader>
                <div className="flex items-center justify-between px-4 py-2">
                  <h2 className="text-lg font-semibold">{title}</h2>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link to={item.href} className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                          {item.href === '/review-submissions' && pendingReviewCount > 0 && (
                            <Badge className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                              {pendingReviewCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                      <LogOut className="h-5 w-5" />
                      <span>خروج</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </div>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
