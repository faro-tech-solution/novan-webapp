import { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import { useTranslation } from "@/utils/translations";
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

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const { tCommon, tSidebar } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const trainerNavItems = [
    {
      href: "/dashboard/trainer",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/courses-management",
      icon: Users,
      label: tSidebar("courseManagement"),
      key: "courseManagement",
    },
    {
      href: "/exercises",
      icon: FileText,
      label: tSidebar("exercises"),
      key: "exercises",
    },
    {
      href: "/review-submissions",
      icon: CheckCircle,
      label: tSidebar("reviewSubmissions"),
      key: "reviewSubmissions",
    },
    {
      href: "/students",
      icon: Award,
      label: tSidebar("students"),
      key: "students",
    },
    {
      href: "/wiki/manage",
      icon: Edit,
      label: tSidebar("wikiManagement"),
      key: "wikiManagement",
    },
    {
      href: "/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
  ];

  const traineeNavItems = [
    {
      href: "/dashboard/trainee",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/my-exercises",
      icon: FileText,
      label: tSidebar("myExercises"),
      key: "myExercises",
    },
    {
      href: "/progress",
      icon: Award,
      label: tSidebar("progress"),
      key: "progress",
    },
    {
      href: "/student-courses",
      icon: BookOpen,
      label: tSidebar("myCourses"),
      key: "myCourses",
    },
    {
      href: "/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
    { href: "/wiki", icon: BookOpen, label: tSidebar("wiki"), key: "wiki" },
  ];

  const adminNavItems = [
    {
      href: "/dashboard/admin",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/user-management",
      icon: UserCog,
      label: tSidebar("userManagement"),
      key: "userManagement",
    },
    {
      href: "/group-management",
      icon: Users,
      label: tSidebar("groupManagement"),
      key: "groupManagement",
    },
    {
      href: "/courses-management",
      icon: BookOpen,
      label: tSidebar("courseManagement"),
      key: "courseManagement",
    },
    {
      href: "/students",
      icon: Award,
      label: tSidebar("students"),
      key: "students",
    },
    {
      href: "/exercises",
      icon: FileText,
      label: tSidebar("exercises"),
      key: "exercises",
    },
    {
      href: "/review-submissions",
      icon: CheckCircle,
      label: tSidebar("reviewSubmissions"),
      key: "reviewSubmissions",
    },
    {
      href: "/accounting",
      icon: Wallet,
      label: tSidebar("accounting"),
      key: "accounting",
    },
    {
      href: "/wiki/manage",
      icon: Edit,
      label: tSidebar("wikiManagement"),
      key: "wikiManagement",
    },
    {
      href: "/tasks-management",
      icon: ListChecks,
      label: tSidebar("tasksManagement"),
      key: "tasksManagement",
    },
    {
      href: "/profile",
      icon: UserCog,
      label: tSidebar("profile"),
      key: "profile",
    },
  ];

  const teammateNavItems = [
    {
      href: "/dashboard/teammate",
      icon: LayoutDashboard,
      label: tSidebar("dashboard"),
      key: "dashboard",
    },
    {
      href: "/tasks",
      icon: CheckCircle,
      label: tSidebar("myTasks"),
      key: "myTasks",
    },
    {
      href: "/profile",
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
        <Header
          isDashboard={true}
          title={title}
          showRole={true}
          onLogout={handleLogout}
          sidebarTrigger={<SidebarTrigger className="md:hidden" />}
        />

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
                    {item.href === "/review-submissions" &&
                      pendingReviewCount > 0 && (
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
                  <span>{tCommon("logout")}</span>
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

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
