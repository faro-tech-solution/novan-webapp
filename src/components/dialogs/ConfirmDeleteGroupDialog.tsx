import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useDeleteGroupMutation } from '@/hooks/queries/useGroupsQuery';
import { Group } from '@/types/group';

interface ConfirmDeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group | null;
}

const ConfirmDeleteGroupDialog = ({ 
  open, 
  onOpenChange, 
  group 
}: ConfirmDeleteGroupDialogProps) => {
  const deleteGroupMutation = useDeleteGroupMutation();

  const handleConfirmDelete = async () => {
    if (!group) return;
    
    try {
      await deleteGroupMutation.mutateAsync(group.id);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأیید حذف گروه</AlertDialogTitle>
          <AlertDialogDescription>
            آیا مطمئن هستید که می‌خواهید گروه "{group?.title}" را حذف کنید؟
            {group?.member_count && group.member_count > 0 && (
              <span className="block mt-2 text-red-600 font-medium">
                این گروه {group.member_count} عضو دارد و حذف آن ممکن است بر روی اعضا تأثیر بگذارد.
              </span>
            )}
            <span className="block mt-2 text-red-600 font-medium">
              این عمل غیرقابل بازگشت است.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>لغو</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirmDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteGroupDialog; 