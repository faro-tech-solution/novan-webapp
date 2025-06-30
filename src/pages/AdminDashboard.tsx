import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, FileText, Award, ListChecks, UserCog } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <DashboardLayout title="پنل مدیریت">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-peyda">پنل مدیریت سیستم</h2>
          <p className="text-gray-600">مدیریت سیستم آموزشی</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مدیریت کاربران</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">مدیریت</div>
              <p className="text-xs text-muted-foreground">کاربران و نقش‌ها</p>
              <Link to="/user-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مدیریت گروه‌ها</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">گروه‌ها</div>
              <p className="text-xs text-muted-foreground">ایجاد و مدیریت گروه‌ها</p>
              <Link to="/group-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مدیریت دوره‌ها</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">دوره‌ها</div>
              <p className="text-xs text-muted-foreground">ایجاد و مدیریت</p>
              <Link to="/courses-management">
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
              <Link to="/students">
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
              <p className="text-xs text-muted-foreground">تمرین‌ها و آزمون‌ها</p>
              <Link to="/exercises">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">وظایف روزانه</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">مدیریت</div>
              <p className="text-xs text-muted-foreground">مدیریت وظایف روزانه</p>
              <Link to="/daily-activities-management">
                <Button variant="outline" size="sm" className="mt-2">
                  مشاهده
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مدیریت وظایف</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">وظایف</div>
              <p className="text-xs text-muted-foreground">تعریف و مدیریت وظایف تیم</p>
              <Link to="/tasks-management">
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
