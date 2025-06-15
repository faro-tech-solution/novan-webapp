
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CourseCardComponent from './CourseCardComponent';

interface Course {
  id: string;
  name: string;
  description: string | null;
  instructor_id: string;
  instructor_name: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
}

interface CourseGridProps {
  courses: Course[];
  userRole?: string;
  userId?: string;
  canCreateCourses: boolean;
  isAdmin: boolean;
  onCreateCourse: () => void;
  onManageTerms: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onViewStudents: (course: Course) => void;
}

const CourseGrid = ({ 
  courses, 
  userRole, 
  userId, 
  canCreateCourses, 
  isAdmin, 
  onCreateCourse, 
  onManageTerms, 
  onEditCourse, 
  onDeleteCourse, 
  onViewStudents 
}: CourseGridProps) => {
  if (courses.length === 0) {
    return (
      <div className="col-span-3 text-center py-8">
        <p className="text-gray-500">
          {isAdmin 
            ? 'هنوز درسی در سیستم ایجاد نشده است' 
            : 'هنوز درسی ایجاد نکرده‌اید'
          }
        </p>
        {canCreateCourses && (
          <Button 
            className="mt-4" 
            onClick={onCreateCourse}
          >
            <Plus className="h-4 w-4 mr-2" />
            ایجاد اولین درس
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCardComponent
          key={course.id}
          course={course}
          userRole={userRole}
          userId={userId}
          onManageTerms={onManageTerms}
          onEditCourse={onEditCourse}
          onDeleteCourse={onDeleteCourse}
          onViewStudents={onViewStudents}
        />
      ))}
    </div>
  );
};

export default CourseGrid;
