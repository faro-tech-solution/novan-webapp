import { ReactNode } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import { useTranslation } from "@/utils/translations";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  LogOut,
  Award,
  UserCog,
  CheckCircle,
  Wallet,
  Edit,
  ListChecks,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSubmissionsQuery } from "@/hooks/useReviewSubmissionsQuery";
import { Badge } from "@/components/ui/badge";
import ActiveCourseSelector from "../courses/ActiveCourseSelector";
import { DashboardPanelProvider } from '@/contexts/DashboardPanelContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { tCommon, tSidebar } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const trainerNavItems = [
    {
      href: "/trainer/dashboard",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/trainer/courses-management",
      icon: Users,
      label: tSidebar("courseManagement"),
      key: "courseManagement",
    },
    {
      href: "/trainer/exercises",
      icon: FileText,
      label: tSidebar("exercises"),
      key: "exercises",
    },
    {
      href: "/trainer/review-submissions",
      icon: CheckCircle,
      label: tSidebar("reviewSubmissions"),
      key: "reviewSubmissions",
    },
    {
      href: "/trainer/students",
      icon: Award,
      label: tSidebar("students"),
      key: "students",
    },
    {
      href: "/trainer/wiki/manage",
      icon: Edit,
      label: tSidebar("wikiManagement"),
      key: "wikiManagement",
    },
    {
      href: "/trainer/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
  ];

  const { courseId } = useParams();
  const traineeNavItems = [
    {
      href: `/trainee/${courseId}/dashboard`,
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: `/trainee/${courseId}/my-exercises`,
      icon: FileText,
      label: tSidebar("myExercises"),
      key: "myExercises",
    },
    {
      href: `/trainee/${courseId}/progress`,
      icon: Award,
      label: tSidebar("progress"),
      key: "progress",
    },
    {
      href: `/trainee/${courseId}/student-courses`,
      icon: BookOpen,
      label: tSidebar("myCourses"),
      key: "myCourses",
    },
    {
      href: `/trainee/${courseId}/profile`,
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
    { href: `/trainee/${courseId}/wiki`, icon: BookOpen, label: tSidebar("wiki"), key: "wiki" },
  ];

  const adminNavItems = [
    {
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/admin/user-management",
      icon: UserCog,
      label: tSidebar("userManagement"),
      key: "userManagement",
    },
    {
      href: "/admin/group-management",
      icon: Users,
      label: tSidebar("groupManagement"),
      key: "groupManagement",
    },
    {
      href: "/admin/courses-management",
      icon: BookOpen,
      label: tSidebar("courseManagement"),
      key: "courseManagement",
    },
    {
      href: "/admin/students",
      icon: Award,
      label: tSidebar("students"),
      key: "students",
    },
    {
      href: "/admin/exercises",
      icon: FileText,
      label: tSidebar("exercises"),
      key: "exercises",
    },
    {
      href: "/admin/review-submissions",
      icon: CheckCircle,
      label: tSidebar("reviewSubmissions"),
      key: "reviewSubmissions",
    },
    {
      href: "/admin/accounting",
      icon: Wallet,
      label: tSidebar("accounting"),
      key: "accounting",
    },
    {
      href: "/admin/wiki/manage",
      icon: Edit,
      label: tSidebar("wikiManagement"),
      key: "wikiManagement",
    },
    {
      href: "/admin/tasks-management",
      icon: ListChecks,
      label: tSidebar("tasksManagement"),
      key: "tasksManagement",
    },
    {
      href: "/admin/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
  ];

  const teammateNavItems = [
    {
      href: "/teammate/dashboard",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/teammate/tasks",
      icon: CheckCircle,
      label: tSidebar("myTasks"),
      key: "myTasks",
    },
    {
      href: "/teammate/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
  ];

  const getNavItems = () => {
    switch (profile?.role) {
      case "trainer":
        return trainerNavItems;
      case "trainee":
        return traineeNavItems;
      case "admin":
        return adminNavItems;
      case "teammate":
        return teammateNavItems;
      default:
        return traineeNavItems;
    }
  };

  const navItems = getNavItems();

  const { data: submissions = [] } = useSubmissionsQuery();
  const pendingReviewCount = submissions.filter((s) => s.score === null).length;

  const getRoleLabel = (role?: string) => {
    const roleKey = role || "user";
    return tSidebar(roleKey);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-gray-50 w-full">
        {/* Use the common Header component with dashboard-specific props */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#f5f7fe' }}>
          <Header
            isDashboard={true}
            title={title}
            showRole={true}
            onLogout={handleLogout}
            sidebarTrigger={<SidebarTrigger className="md:hidden" />}
          />
        </div>

        <div className="flex min-h-[calc(100vh-theme(space.20))]">
          {/* Desktop Sidebar */}
          <div
            className="hidden md:block w-64"
            style={{
              background: '#f5f7fe',
              boxShadow: 'none',
              border: 'none',
              position: 'sticky',
              top: '64px', // adjust if header height changes
              zIndex: 40,
              height: 'calc(100vh - 64px)',
              minHeight: 0,
            }}
          >
            <div className="h-full py-4" style={{ height: '100%' }}>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-4 py-2 relative transition
                        ${isActive ? 'bg-[rgb(237,238,245)] text-gray-900 rounded-tr-[20px] rounded-br-[20px] mr-5' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
                      `}
                    >
                      <item.icon className="h-5 w-5 ml-3" />
                      <span>{item.label}</span>
                      {item.href === "/review-submissions" &&
                        pendingReviewCount > 0 && (
                          <Badge className="absolute left-2 top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {pendingReviewCount}
                          </Badge>
                        )}
                    </Link>
                  );
                })}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5 ml-3" />
                  <span>{tCommon("logout")}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div
            className="md:hidden"
            style={{
              background: '#f5f7fe',
              boxShadow: 'none',
              border: 'none',
              position: 'sticky',
              top: '64px', // adjust if header height changes
              zIndex: 40,
              height: 'calc(100vh - 64px)',
              minHeight: 0,
            }}
          >
            <Sidebar variant="inset" collapsible="icon" style={{ background: '#f5f7fe', boxShadow: 'none', border: 'none', height: '100%' }}>
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
                          {item.href === "/review-submissions" &&
                            pendingReviewCount > 0 && (
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
                      <span>{tCommon("logout")}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </div>

          <main
            className="flex-1 p-6"
            style={{
              minWidth: 0,
              minHeight: 0,
              overflow: 'auto',
              backgroundColor: '#edeef5',
              borderRadius: '24px',
              margin: '0 0 10px 10px',
              position: 'relative',
            }}
          >
            <ActiveCourseSelector />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
