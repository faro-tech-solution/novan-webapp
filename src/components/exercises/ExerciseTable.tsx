
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Award,
  Calendar
} from 'lucide-react';
import { Exercise } from '@/types/exercise';
import { getExerciseStatusBadge, getDifficultyBadge } from './ExerciseStatusBadges';

interface ExerciseTableProps {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  onDeleteExercise: (id: string) => void;
}

export const ExerciseTable = ({ exercises, filteredExercises, onDeleteExercise }: ExerciseTableProps) => {
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
              <TableHead>وضعیت تمرین</TableHead>
              <TableHead>موعد تحویل</TableHead>
              <TableHead>ارسال‌ها</TableHead>
              <TableHead>میانگین نمره</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExercises.map((exercise) => (
              <TableRow key={exercise.id} className={exercise.exercise_status === 'overdue' ? 'bg-red-50' : ''}>
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
                <TableCell>{getExerciseStatusBadge(exercise.exercise_status || 'active')}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{exercise.due_date}</span>
                  </div>
                </TableCell>
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
                    <Link to={`/exercise/${exercise.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Button size="sm" variant="outline">
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
