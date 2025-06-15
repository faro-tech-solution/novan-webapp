
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Clock, FileText, Award, Search, Calendar, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/components/DashboardLayout';
import { useExercises } from '@/hooks/useExercises';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_name: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  status: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
}

const MyExercises = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [myExercises, setMyExercises] = useState<ExerciseWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const fetchMyExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching exercises for student:', user.id);

      // Fetch exercises with submission data
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('status', 'active')
        .order('due_date', { ascending: true });

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        setError('خطا در دریافت تمرین‌ها');
        return;
      }

      if (!exercises) {
        setMyExercises([]);
        return;
      }

      // Fetch submissions for the current user
      const { data: submissions, error: submissionsError } = await supabase
        .from('exercise_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      }

      // Combine exercises with submission data
      const exercisesWithSubmissions: ExerciseWithSubmission[] = exercises.map(exercise => {
        const submission = submissions?.find(sub => sub.exercise_id === exercise.id);
        
        // Calculate submission status
        let submissionStatus: 'not_started' | 'pending' | 'completed' | 'overdue' = 'not_started';
        const today = new Date();
        const dueDate = new Date(exercise.due_date);
        const openDate = new Date(exercise.open_date);
        const closeDate = new Date(exercise.close_date);

        if (submission) {
          if (submission.score !== null) {
            submissionStatus = 'completed';
          } else {
            submissionStatus = 'pending';
          }
        } else {
          if (today > closeDate) {
            submissionStatus = 'overdue';
          } else if (today >= openDate && today <= closeDate) {
            submissionStatus = 'not_started';
          }
        }

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_name: exercise.course_name,
          difficulty: exercise.difficulty,
          due_date: exercise.due_date,
          open_date: exercise.open_date,
          close_date: exercise.close_date,
          points: exercise.points,
          estimated_time: exercise.estimated_time,
          status: exercise.status,
          submission_status: submissionStatus,
          submitted_at: submission?.submitted_at || null,
          score: submission?.score || null,
          feedback: submission?.feedback || null,
        };
      });

      setMyExercises(exercisesWithSubmissions);
    } catch (err) {
      console.error('Error in fetchMyExercises:', err);
      setError('خطا در دریافت تمرین‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyExercises();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">تکمیل شده</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">در انتظار بررسی</Badge>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  // Filter exercises based on search and filters
  const filteredExercises = myExercises.filter(exercise => {
    const matchesSearch = exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || exercise.submission_status === statusFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty;
  });

  // Calculate stats
  const stats = {
    total: myExercises.length,
    completed: myExercises.filter(e => e.submission_status === 'completed').length,
    pending: myExercises.filter(e => e.submission_status === 'pending').length,
    overdue: myExercises.filter(e => e.submission_status === 'overdue').length,
    averageScore: myExercises.filter(e => e.score !== null).length > 0 
      ? Math.round(
          myExercises.filter(e => e.score !== null).reduce((sum, e) => sum + (e.score || 0), 0) /
          myExercises.filter(e => e.score !== null).length
        )
      : 0
  };

  if (loading) {
    return (
      <DashboardLayout title="تمرین‌های من">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری تمرین‌ها...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="تمرین‌های من">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchMyExercises} className="mt-4">
            تلاش مجدد
          </Button>
        </div>
      </DashboardLayout>
    );
  }

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
              <CardTitle className="text-sm font-medium">در انتظار بررسی</CardTitle>
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
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageScore > 0 ? `${stats.averageScore}%` : '-'}
              </div>
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
                  <SelectItem value="pending">در انتظار بررسی</SelectItem>
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
              {filteredExercises.length} تمرین از {myExercises.length} تمرین
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredExercises.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {myExercises.length === 0 ? 'هیچ تمرینی برای شما تعریف نشده است.' : 'هیچ تمرینی با فیلترهای انتخابی یافت نشد.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عنوان</TableHead>
                    <TableHead>درس</TableHead>
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
                          {getStatusIcon(exercise.submission_status)}
                          {getStatusBadge(exercise.submission_status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{exercise.title}</div>
                          {exercise.description && (
                            <div className="text-sm text-gray-600 truncate max-w-xs">
                              {exercise.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">{exercise.course_name}</span>
                      </TableCell>
                      <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(exercise.due_date)}</span>
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
                      <TableCell>{exercise.estimated_time}</TableCell>
                      <TableCell>
                        <Link to={`/exercises/${exercise.id}`}>
                          <Button size="sm" variant="outline">
                            {exercise.submission_status === 'completed' ? 'مشاهده' : 'شروع'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyExercises;
