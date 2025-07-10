import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Course } from '@/types/course';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  title?: string;
  description?: string;
  onConfirmDelete: () => void;
  isLoading?: boolean;
}

const ConfirmDeleteDialog = ({ 
  open, 
  onOpenChange, 
  course, 
  title = "تأیید حذف",
  description,
  onConfirmDelete,
  isLoading = false
}: ConfirmDeleteDialogProps) => {
  // Determine what to show based on props
  const dialogTitle = title || (course ? "تأیید حذف درس" : "تأیید حذف");
  const dialogDescription = description || (course ? 
    `آیا مطمئن هستید که می‌خواهید درس "${course?.name}" را حذف کنید؟` :
    `آیا مطمئن هستید که می‌خواهید این مورد را حذف کنید؟`
  );
  
  const isDisabled = course?.student_count ? course.student_count > 0 : false;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {dialogDescription}
            {course?.student_count && course.student_count > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                این درس {course.student_count} دانشجو دارد و قابل حذف نیست.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>لغو</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmDelete}
            disabled={isDisabled || isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            {isLoading ? "در حال حذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteDialog;
