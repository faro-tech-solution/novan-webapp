
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, FileText, Award, Search, Calendar, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';

const MyExercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Mock exercises data
  const exercises = [
    {
      id: 1,
      title: 'مبانی React Hooks',
      description: 'یادگیری مفاهیم اساسی React Hooks شامل useState و useEffect',
      dueDate: '۱۴۰۳/۰۶/۱۶',
      status: 'pending',
      difficulty: 'متوسط',
      points: 100,
      estimatedTime: '۲ ساعت',
      submittedAt: null,
      score: null,
      className: 'توسعه وب مقدماتی'
    },
    {
      id: 2,
      title: 'طراحی CSS Grid',
      description: 'ایجاد لایوت‌های پیشرفته با استفاده از CSS Grid',
      dueDate: '۱۴۰۳/۰۶/۱۸',
      status: 'completed',
      difficulty: 'آسان',
      points: 80,
      estimatedTime: '۱ ساعت',
      submittedAt: '۱۴۰۳/۰۶/۱۵',
      score: 95,
      className: 'توسعه وب مقدماتی'
    },
    {
      id: 3,
      title: 'JavaScript Promises',
      description: 'کار با Promises و async/await در JavaScript',
      dueDate: '۱۴۰۳/۰۶/۲۰',
      status: 'not_started',
      difficulty: 'سخت',
      points: 120,
      estimatedTime: '۳ ساعت',
      submittedAt: null,
      score: null,
      className: 'توسعه وب مقدماتی'
    },
    {
      id: 4,
      title: 'فرم‌های HTML',
      description: 'ایجاد و اعتبارسنجی فرم‌های HTML',
      dueDate: '۱۴۰۳/۰۶/۱۲',
      status: 'completed',
      difficulty: 'آسان',
      points: 60,
      estimatedTime: '۱ ساعت',
      submittedAt: '۱۴۰۳/۰۶/۱۰',
      score: 88,
      className: 'توسعه وب مقدماتی'
    },
    {
      id: 5,
      title: 'انیمیشن‌های CSS',
      description: 'ایجاد انیمیشن‌های زیبا با CSS',
      dueDate: '۱۴۰۳/۰۶/۰۸',
      status: 'completed',
      difficulty: 'متوسط',
      points: 90,
      estimatedTime: '۲ ساعت',
      submittedAt: '۱۴۰۳/۰۶/۰۶',
      score: 92,
      className: 'توسعه وب مقدماتی'
    },
    {
      id: 6,
      title: 'Responsive Design',
      description: 'طراحی ریسپانسیو با استفاده از CSS و Media Queries',
      dueDate: '۱۴۰۳/۰۶/۲۵',
      status: 'overdue',
      difficulty: 'متوسط',
      points: 100,
      estimatedTime: '۲ ساعت',
      submittedAt: null,
      score: null,
      className: 'توسعه وب مقدماتی'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">تکمیل شده</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">در انتظار</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">دیرکرد</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800">شروع نشده</Badge>;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter exercises based on search and filters
  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exercise.status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  // Calculate stats
  const stats = {
    total: exercises.length,
    completed: exercises.filter(e => e.status === 'completed').length,
    pending: exercises.filter(e => e.status === 'pending').length,
    overdue: exercises.filter(e => e.status === 'overdue').length,
    averageScore: Math.round(
      exercises.filter(e => e.score !== null).reduce((sum, e) => sum + (e.score || 0), 0) /
      exercises.filter(e => e.score !== null).length
    )
  };

  return (
    <DashboardLayout title="تمرین‌های من">
      <div className="space-y-6">
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
              <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">در انتظار</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">دیرکرد</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">میانگین نمره</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.averageScore}%</div>
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
                  <SelectItem value="completed">تکمیل شده</SelectItem>
                  <SelectItem value="pending">در انتظار</SelectItem>
                  <SelectItem value="overdue">دیرکرد</SelectItem>
                  <SelectItem value="not_started">شروع نشده</SelectItem>
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
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عنوان</TableHead>
                  <TableHead>سطح</TableHead>
                  <TableHead>موعد تحویل</TableHead>
                  <TableHead>امتیاز</TableHead>
                  <TableHead>نمره</TableHead>
                  <TableHead>زمان تخمینی</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {getStatusIcon(exercise.status)}
                        {getStatusBadge(exercise.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{exercise.title}</div>
                        <div className="text-sm text-gray-600">{exercise.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{exercise.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span>{exercise.points}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {exercise.score !== null ? (
                        <span className="font-medium text-green-600">{exercise.score}%</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{exercise.estimatedTime}</TableCell>
                    <TableCell>
                      <Link to={`/exercise/${exercise.id}`}>
                        <Button size="sm" variant="outline">
                          {exercise.status === 'completed' ? 'مشاهده' : 'شروع'}
                        </Button>
                      </Link>
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

export default MyExercises;
