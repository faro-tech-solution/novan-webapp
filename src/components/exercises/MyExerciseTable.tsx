'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { ResponsiveTable } from '@/components/ui/responsive-table';
import { CheckCircle, Clock, FileText, Award } from 'lucide-react';
import { MyExerciseWithSubmission } from '@/types/exercise';
import { getExerciseTypeIconSmall } from '@/utils/exerciseTypeIcons';

interface MyExerciseTableProps {
  exercises: MyExerciseWithSubmission[];
}

export const MyExerciseTable = ({ exercises }: MyExerciseTableProps) => {
  const params = useParams();
  const courseId = params?.courseId as string;
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100 transition-colors">تکمیل شده</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-800 hover:text-yellow-100 transition-colors">در انتظار بررسی</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-800 hover:text-red-100 transition-colors">دیرکرد</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-800 hover:text-gray-100 transition-colors">انجام نشده</Badge>;
      default:
        return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{status}</Badge>;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-800 hover:text-green-100 transition-colors">{difficulty}</Badge>;
      case 'متوسط':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-800 hover:text-yellow-100 transition-colors">{difficulty}</Badge>;
      case 'سخت':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-800 hover:text-red-100 transition-colors">{difficulty}</Badge>;
      default:
        return <Badge variant="outline" className="hover:bg-foreground hover:text-background transition-colors">{difficulty}</Badge>;
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

  const tableHeaders = [
    'وضعیت',
    'عنوان',
    'سطح',
    'امتیاز',
    'زمان تخمینی',
    'عملیات'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>لیست تمرین‌ها</CardTitle>
        <CardDescription>
          {exercises.length} تمرین
        </CardDescription>
      </CardHeader>
      <CardContent>
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            هیچ تمرینی برای شما تعریف نشده است.
          </div>
        ) : (
          <ResponsiveTable headers={tableHeaders}>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {getStatusIcon(exercise.submission_status)}
                    {getStatusBadge(exercise.submission_status)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium flex items-center gap-2">
                    {getExerciseTypeIconSmall(exercise.exercise_type)}
                    {exercise.title}
                  </div>
                </TableCell>
                <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>{exercise.points}</span>
                  </div>
                </TableCell>
                <TableCell>{exercise.estimated_time}</TableCell>
                <TableCell>
                  <Link href={courseId ? `/portal/trainee/${courseId}/exercise/${exercise.id}` : `/portal/exercise/${exercise.id}` }>
                    <Button size="sm" variant="outline">
                      {exercise.submission_status === 'completed' ? 'مشاهده' : 'شروع'}
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </ResponsiveTable>
        )}
      </CardContent>
    </Card>
  );
};
