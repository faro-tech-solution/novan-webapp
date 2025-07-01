import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, Pencil, Trash2 } from 'lucide-react';
import { Course } from '@/types/course';

interface CourseActionsProps {
  course: Course;
  userRole?: string;
  userId?: string;
  onManageTerms: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
}

const CourseActions = ({ 
  course, 
  userRole, 
  userId, 
  onManageTerms, 
  onEditCourse, 
  onDeleteCourse 
}: CourseActionsProps) => {
  // Only admins can edit/delete courses
  const canEdit = userRole === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white border shadow-md">
        <DropdownMenuItem 
          onClick={() => onManageTerms(course)}
          className="cursor-pointer"
        >
          <Calendar className="h-4 w-4 mr-2" />
          مشاهده ترم‌ها
        </DropdownMenuItem>
        {canEdit && (
          <>
            <DropdownMenuItem 
              onClick={() => onEditCourse(course)}
              className="cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" />
              ویرایش
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDeleteCourse(course)}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              حذف
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CourseActions;
