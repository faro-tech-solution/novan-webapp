
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Users, Search, MoreHorizontal, UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const CourseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const courses = [
    {
      id: '1',
      name: 'Web Development Basics',
      students: 24,
      exercises: 12,
      averageScore: 85,
      instructor: 'John Trainer',
      startDate: '2025-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Advanced JavaScript',
      students: 18,
      exercises: 8,
      averageScore: 78,
      instructor: 'Sarah Wilson',
      startDate: '2025-02-01',
      status: 'active'
    },
    {
      id: '3',
      name: 'React Fundamentals',
      students: 15,
      exercises: 6,
      averageScore: 92,
      instructor: 'Mike Johnson',
      startDate: '2025-03-01',
      status: 'upcoming'
    }
  ];

  const students = [
    { id: '1', name: 'Jane Student', email: 'jane@example.com', courseId: '1', joinDate: '2025-01-15', status: 'active' },
    { id: '2', name: 'Bob Learner', email: 'bob@example.com', courseId: '1', joinDate: '2025-01-16', status: 'active' },
    { id: '3', name: 'Alice Wonder', email: 'alice@example.com', courseId: '2', joinDate: '2025-02-01', status: 'active' },
    { id: '4', name: 'Charlie Brown', email: 'charlie@example.com', courseId: '1', joinDate: '2025-01-20', status: 'inactive' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Course Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">درس‌ها</h2>
            <p className="text-gray-600">مدیریت درس‌ها و دانشجویان شما</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            ایجاد درس
          </Button>
        </div>

        {/* Courses Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>
                      مربی: {course.instructor}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(course.status)}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">دانشجویان:</span>
                    <span className="font-medium">{course.students}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">تمرین‌ها:</span>
                    <span className="font-medium">{course.exercises}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">میانگین نمره:</span>
                    <span className="font-medium">{course.averageScore}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">تاریخ شروع:</span>
                    <span className="font-medium">{course.startDate}</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-1" />
                      مشاهده دانشجویان
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Students Management */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>دانشجویان</CardTitle>
                <CardDescription>مدیریت ثبت‌نام دانشجویان و وضعیت آن‌ها</CardDescription>
              </div>
              <Button variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                ثبت‌نام دانشجو
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 mt-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="جستجوی دانشجویان..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>درس</TableHead>
                  <TableHead>تاریخ پیوستن</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentCourse = courses.find(c => c.id === student.courseId);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{studentCourse?.name || 'بدون درس'}</TableCell>
                      <TableCell>{student.joinDate}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          مشاهده پروفایل
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;
