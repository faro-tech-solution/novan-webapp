
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Award,
  Calendar,
  Users,
  FileText
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';

const Exercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  // Mock exercises data
  const exercises = [
    {
      id: 1,
      title: 'مبانی React Hooks',
      description: 'یادگیری مفاهیم اساسی React Hooks شامل useState و useEffect',
      className: 'توسعه وب مقدماتی',
      difficulty: 'متوسط',
      dueDate: '۱۴۰۳/۰۶/۱۶',
      points: 100,
      estimatedTime: '۲ ساعت',
      submissions: 15,
      totalStudents: 20,
      averageScore: 85,
      status: 'active',
      createdDate: '۱۴۰۳/۰۶/۰۱'
    },
    {
      id: 2,
      title: 'طراحی CSS Grid',
      description: 'ایجاد لایوت‌های پیشرفته با استفاده از CSS Grid',
      className: 'توسعه وب مقدماتی',
      difficulty: 'آسان',
      dueDate: '۱۴۰۳/۰۶/۱۸',
      points: 80,
      estimatedTime: '۱ ساعت',
      submissions: 18,
      totalStudents: 20,
      averageScore: 92,
      status: 'active',
      createdDate: '۱۴۰۳/۰۶/۰۳'
    },
    {
      id: 3,
      title: 'JavaScript Promises',
      description: 'کار با Promises و async/await در JavaScript',
      className: 'توسعه وب پیشرفته',
      difficulty: 'سخت',
      dueDate: '۱۴۰۳/۰۶/۱۰',
      points: 120,
      estimatedTime: '۳ ساعت',
      submissions: 12,
      totalStudents: 15,
      averageScore: 78,
      status: 'completed',
      createdDate: '۱۴۰۳/۰۵/۲۵'
    },
    {
      id: 4,
      title: 'فرم‌های HTML',
      description: 'ایجاد و اعتبارسنجی فرم‌های HTML',
      className: 'توسعه وب مقدماتی',
      difficulty: 'آسان',
      dueDate: '۱۴۰۳/۰۶/۲۲',
      points: 60,
      estimatedTime: '۱ ساعت',
      submissions: 0,
      totalStudents: 20,
      averageScore: 0,
      status: 'draft',
      createdDate: '۱۴۰۳/۰۶/۱۰'
    }
  ];

  const classes = ['توسعه وب مقدماتی', 'توسعه وب پیشرفته', 'موبایل اپلیکیشن'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">تکمیل شده</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">پیش‌نویس</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان':
        return <Badge className="bg-green-100 text-green-800">{difficulty}</Badge>;
      case 'متوسط':
        return <Badge className="bg-yellow-100 text-yellow-800">{difficulty}</Badge>;
      case 'سخت':
        return <Badge className="bg-red-100 text-red-800">{difficulty}</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exercise.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    const matchesClass = classFilter === 'all' || exercise.className === classFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesClass;
  });

  // Calculate stats
  const stats = {
    total: exercises.length,
    active: exercises.filter(e => e.status === 'active').length,
    completed: exercises.filter(e => e.status === 'completed').length,
    draft: exercises.filter(e => e.status === 'draft').length,
    averageSubmissionRate: Math.round(
      exercises.reduce((sum, e) => sum + (e.submissions / e.totalStudents) * 100, 0) / exercises.length
    )
  };

  return (
    <DashboardLayout title="مدیریت تمرین‌ها">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">مدیریت تمرین‌ها</h2>
            <p className="text-gray-600">ایجاد و مدیریت تمرین‌های دانشجویان</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            تمرین جدید
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل تمرین‌ها</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">فعال</CardTitle>
              <Clock className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">پیش‌نویس</CardTitle>
              <Edit className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نرخ ارسال</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.averageSubmissionRate}%</div>
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
                    placeholder="جستجو در تمرین‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="active">فعال</SelectItem>
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="draft">پیش‌نویس</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="سطح دشواری" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">همه سطوح</SelectItem>
                  <SelectItem value="آسان">آسان</SelectItem>
                  <SelectItem value="متوسط">متوسط</SelectItem>
                  <SelectItem value="سخت">سخت</SelectItem>
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        {/* Exercises Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست تمرین‌ها</CardTitle>
            <CardDescription>
              {filteredExercises.length} تمرین از {exercises.length} تمرین
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>عنوان</TableHead>
                  <TableHead>کلاس</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>موعد تحویل</TableHead>
                  <TableHead>ارسال‌ها</TableHead>
                  <TableHead>میانگین نمره</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exercise.title}</div>
                        <div className="text-sm text-gray-600">{exercise.description}</div>
                        <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{exercise.estimatedTime}</span>
                          <Award className="h-3 w-3" />
                          <span>{exercise.points} امتیاز</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{exercise.className}</Badge>
                    </TableCell>
                    <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>
                    <TableCell>{getStatusBadge(exercise.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{exercise.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{exercise.submissions}/{exercise.totalStudents}</div>
                        <div className="text-xs text-gray-500">
                          {Math.round((exercise.submissions / exercise.totalStudents) * 100)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {exercise.averageScore > 0 ? (
                        <span className="font-medium">{exercise.averageScore}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Link to={`/exercise/${exercise.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
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

export default Exercises;
