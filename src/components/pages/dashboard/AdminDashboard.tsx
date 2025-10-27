import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  FileText,
  Award,
  MessageSquare,
} from "lucide-react";
import Link from 'next/link';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="پنل مدیریت">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-yekanbakh">
            پنل مدیریت سیستم
          </h2>
          <p className="text-gray-600">مدیریت سیستم آموزشی</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مدیریت کاربران
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">مدیریت</div>
              <p className="text-xs text-muted-foreground">کاربران و نقش‌ها</p>
              <Link href="/portal/admin/user-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مدیریت دوره‌ها
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">دوره‌ها</div>
              <p className="text-xs text-muted-foreground">ایجاد و مدیریت</p>
              <Link href="/portal/admin/courses-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">دانشجویان</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">لیست</div>
              <p className="text-xs text-muted-foreground">مشاهده دانشجویان</p>
              <Link href="/portal/admin/students">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تمرین‌ها</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">مدیریت</div>
              <p className="text-xs text-muted-foreground">
                تمرین‌ها و آزمون‌ها
              </p>
              <Link href="/portal/admin/exercises">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پرسش و پاسخ</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">مدیریت</div>
              <p className="text-xs text-muted-foreground">
                سوالات و پاسخ‌های دانشجویان
              </p>
              <Link href="/portal/admin/qa-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
