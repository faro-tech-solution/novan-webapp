
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Mail, 
  Award,
  TrendingUp,
  Clock,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock students data
  const students = [
    {
      id: 1,
      name: 'سارا احمدی',
      email: 'sara.ahmadi@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۵/۱۵',
      status: 'active',
      completedExercises: 12,
      totalExercises: 15,
      averageScore: 88,
      lastActivity: '۲ ساعت پیش',
      totalPoints: 1240
    },
    {
      id: 2,
      name: 'علی محمدی',
      email: 'ali.mohammadi@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۵/۲۰',
      status: 'active',
      completedExercises: 10,
      totalExercises: 15,
      averageScore: 92,
      lastActivity: '۱ روز پیش',
      totalPoints: 1380
    },
    {
      id: 3,
      name: 'فاطمه رضایی',
      email: 'fatemeh.rezaei@example.com',
      className: 'توسعه وب پیشرفته',
      joinDate: '۱۴۰۳/۰۴/۱۰',
      status: 'active',
      completedExercises: 18,
      totalExercises: 20,
      averageScore: 95,
      lastActivity: '۳۰ دقیقه پیش',
      totalPoints: 1710
    },
    {
      id: 4,
      name: 'محمد حسینی',
      email: 'mohammad.hosseini@example.com',
      className: 'توسعه وب مقدماتی',
      joinDate: '۱۴۰۳/۰۶/۰۱',
      status: 'inactive',
      completedExercises: 5,
      totalExercises: 15,
      averageScore: 72,
      lastActivity: '۱ هفته پیش',
      totalPoints: 360
    },
    {
      id: 5,
      name: 'زهرا کریمی',
      email: 'zahra.karimi@example.com',
      className: 'موبایل اپلیکیشن',
      joinDate: '۱۴۰۳/۰۵/۰۸',
      status: 'active',
      completedExercises: 14,
      totalExercises: 16,
      averageScore: 89,
      lastActivity: '۴ ساعت پیش',
      totalPoints: 1246
    }
  ];

  const classes = ['توسعه وب مقدماتی', 'توسعه وب پیشرفته', 'موبایل اپلیکیشن'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">غیرفعال</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === 'all' || student.className === classFilter;
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    averageScore: Math.round(
      students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
    ),
    averageCompletion: Math.round(
      students.reduce((sum, s) => sum + (s.completedExercises / s.totalExercises) * 100, 0) / students.length
    )
  };

  return (
    <DashboardLayout title="مدیریت دانشجویان">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت دانشجویان</h2>
            <p className="text-gray-600">مشاهده و مدیریت دانشجویان کلاس‌های شما</p>
          </div>
          <Button>
            <UserPlus className="h-4 w-4 ml-2" />
            افزودن دانشجو
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل دانشجویان</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">فعال</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">غیرفعال</CardTitle>
              <Clock className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین تکمیل</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageCompletion}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 ml-2" />
              فیلتر و جستجو
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجو در دانشجویان..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="کلاس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه کلاس‌ها</SelectItem>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="inactive">غیرفعال</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست دانشجویان</CardTitle>
            <CardDescription>
              {filteredStudents.length} دانشجو از {students.length} دانشجو
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>دانشجو</TableHead>
                  <TableHead>کلاس</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>پیشرفت</TableHead>
                  <TableHead>میانگین نمره</TableHead>
                  <TableHead>امتیاز کل</TableHead>
                  <TableHead>آخرین فعالیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Mail className="h-3 w-3 ml-1" />
                          {student.email}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          <Calendar className="h-3 w-3 ml-1" />
                          عضو از {student.joinDate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.className}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{student.completedExercises}/{student.totalExercises}</span>
                          <span>{Math.round((student.completedExercises / student.totalExercises) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full" 
                            style={{ width: `${(student.completedExercises / student.totalExercises) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-yellow-500 ml-1" />
                        <span className="font-medium">{student.averageScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-purple-600">{student.totalPoints}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{student.lastActivity}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Students;
