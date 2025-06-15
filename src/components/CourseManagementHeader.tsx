
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CourseManagementHeaderProps {
  isAdmin: boolean;
  canCreateCourses: boolean;
  onCreateCourse: () => void;
}

const CourseManagementHeader = ({ 
  isAdmin, 
  canCreateCourses, 
  onCreateCourse 
}: CourseManagementHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'تمام درس‌ها' : 'درس‌ها'}
        </h2>
        <p className="text-gray-600">
          {isAdmin 
            ? 'مدیریت تمام درس‌های سیستم' 
            : 'مدیریت درس‌ها و دانشجویان شما'
          }
        </p>
      </div>
      {canCreateCourses && (
        <Button onClick={onCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          ایجاد درس
        </Button>
      )}
    </div>
  );
};

export default CourseManagementHeader;
