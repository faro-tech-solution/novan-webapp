
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, FileText, Award, Calendar } from 'lucide-react';

interface ExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_name?: string;
  difficulty: string;
  due_date: string;
  points: number;
  estimated_time: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  score: number | null;
}

interface MyExerciseTableProps {
  exercises: ExerciseWithSubmission[];
  filteredExercises: ExerciseWithSubmission[];
}

export const MyExerciseTable = ({ exercises, filteredExercises }: MyExerciseTableProps) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست تمرین‌ها</CardTitle>
        <CardDescription>
          {filteredExercises.length} تمرین از {exercises.length} تمرین
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {exercises.length === 0 ? 'هیچ تمرینی برای شما تعریف نشده است.' : 'هیچ تمرینی با فیلترهای انتخابی یافت نشد.'}
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
                    <span className="text-sm text-gray-600">{exercise.course_name || 'نامشخص'}</span>
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
  );
};
