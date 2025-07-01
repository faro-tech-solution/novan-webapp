import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Course } from '@/types/course';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  onConfirmDelete: () => void;
}

const ConfirmDeleteDialog = ({ 
  open, 
  onOpenChange, 
  course, 
  onConfirmDelete 
}: ConfirmDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأیید حذف درس</AlertDialogTitle>
          <AlertDialogDescription>
            آیا مطمئن هستید که می‌خواهید درس "{course?.name}" را حذف کنید؟
            {course?.student_count && course.student_count > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                این درس {course.student_count} دانشجو دارد و قابل حذف نیست.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>لغو</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete}
            disabled={course?.student_count ? course.student_count > 0 : false}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
