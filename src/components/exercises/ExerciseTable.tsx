
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Award,
  Calendar
} from 'lucide-react';
import { Exercise } from '@/types/exercise';
import { getExerciseStatusBadge, getDifficultyBadge } from './ExerciseStatusBadges';
import { useAuth } from '@/contexts/AuthContext';

interface ExerciseTableProps {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  onDeleteExercise: (id: string) => void;
  onEditExercise?: (exercise: Exercise) => void;
}

export const ExerciseTable = ({ exercises, filteredExercises, onDeleteExercise, onEditExercise }: ExerciseTableProps) => {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'trainee';

  const handleEditClick = (exercise: Exercise) => {
    if (onEditExercise) {
      onEditExercise(exercise);
    }
  };

  const formatRelativeDays = (days: number) => {
    if (days === 0) return 'امروز';
    if (days === 1) return 'فردا';
    if (days > 0) return `${days} روز بعد`;
    return `${Math.abs(days)} روز قبل`;
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>دوره</TableHead>
              <TableHead>سطح</TableHead>
              {isStudent && <TableHead>وضعیت تمرین</TableHead>}
              {isStudent && <TableHead>تاریخ باز شدن</TableHead>}
              {isStudent && <TableHead>مهلت تحویل</TableHead>}
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
                      <span>{exercise.estimated_time}</span>
                      <Award className="h-3 w-3" />
                      <span>{exercise.points} امتیاز</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{exercise.course_name}</Badge>
                </TableCell>
                <TableCell>{getDifficultyBadge(exercise.difficulty)}</TableCell>
                {isStudent && (
                  <TableCell>{getExerciseStatusBadge(exercise.exercise_status || 'active')}</TableCell>
                )}
                {isStudent && (
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatRelativeDays(exercise.days_to_open)}</span>
                    </div>
                  </TableCell>
                )}
                {isStudent && (
                  <TableCell>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatRelativeDays(exercise.days_to_due)}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">{exercise.submissions || 0}/{exercise.total_students || 0}</div>
                    <div className="text-xs text-gray-500">
                      {exercise.total_students ? Math.round(((exercise.submissions || 0) / exercise.total_students) * 100) : 0}%
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {(exercise.average_score || 0) > 0 ? (
                    <span className="font-medium">{exercise.average_score}%</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditClick(exercise)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => onDeleteExercise(exercise.id)}
                    >
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
  );
};
