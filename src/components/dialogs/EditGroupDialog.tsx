import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateGroupMutation } from '@/hooks/queries/useGroupsQuery';
import { Group, UpdateGroupData } from '@/types/group';

const editGroupSchema = z.object({
  title: z.string().min(1, 'عنوان گروه الزامی است'),
  description: z.string().optional(),
  telegram_channels: z.string().optional(),
});

type EditGroupFormData = z.infer<typeof editGroupSchema>;

interface EditGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: Group;
}

const EditGroupDialog = ({ open, onOpenChange, group }: EditGroupDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateGroupMutation = useUpdateGroupMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditGroupFormData>({
    resolver: zodResolver(editGroupSchema),
  });

  // Reset form when group changes
  useEffect(() => {
    if (group) {
      reset({
        title: group.title,
        description: group.description || '',
        telegram_channels: group.telegram_channels || '',
      });
    }
  }, [group, reset]);

  const onSubmit = async (data: EditGroupFormData) => {
    setIsSubmitting(true);
    try {
      const groupData: UpdateGroupData = {
        title: data.title,
        description: data.description || undefined,
        telegram_channels: data.telegram_channels || undefined,
      };
      await updateGroupMutation.mutateAsync({ id: group.id, data: groupData });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ویرایش گروه</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان گروه *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="عنوان گروه را وارد کنید"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="توضیحات گروه (اختیاری)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram_channels">کانال‌های تلگرام</Label>
            <Input
              id="telegram_channels"
              {...register('telegram_channels')}
              placeholder="شناسه کانال‌ها را با کاما جدا کنید (اختیاری)"
            />
            <p className="text-xs text-gray-500">
              مثال: @channel1, @channel2, -1001234567890
            </p>
          </div>

          <div className="flex justify-end space-x-2 space-x-reverse pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'در حال بروزرسانی...' : 'بروزرسانی گروه'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog; 