import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import CourseActions from './CourseActions';
import { Course } from '@/types/course';

interface CourseCardComponentProps {
  course: Course;
  userRole?: string;
  userId?: string;
  onManageCategories: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onViewStudents: (course: Course) => void;
}

const CourseCardComponent = ({ 
  course, 
  userRole, 
  userId, 
  onManageCategories,
  onEditCourse, 
  onDeleteCourse, 
  onViewStudents 
}: CourseCardComponentProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
  
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
  
      case 'completed': return 'تکمیل شده';
      case 'inactive': return 'غیرفعال';
      default: return status;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <CardDescription>
              مربی: نامشخص
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(course.status || 'active')}>
              {getStatusText(course.status || 'active')}
            </Badge>
            <CourseActions
              course={course}
              userRole={userRole}
              userId={userId}
              onManageCategories={onManageCategories}
              onEditCourse={onEditCourse}
              onDeleteCourse={onDeleteCourse}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">دانشجویان:</span>
            <span className="font-medium">{course.student_count || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">حداکثر ظرفیت:</span>
            <span className="font-medium">
              {course.max_students === 0 || course.max_students === null ? 'نامحدود' : course.max_students}
            </span>
          </div>
          {course.description && (
            <div className="text-sm text-gray-600">
              <p className="line-clamp-2">{course.description}</p>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => onViewStudents(course)}
            >
              <Users className="h-4 w-4 mr-1" />
              مشاهده دانشجویان
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCardComponent;
