import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGroupMutation } from '@/hooks/queries/useGroupsQuery';
import { CreateGroupData } from '@/types/group';

const createGroupSchema = z.object({
  title: z.string().min(1, 'عنوان گروه الزامی است'),
  description: z.string().optional(),
  telegram_channels: z.string().optional(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupDialog = ({ open, onOpenChange }: CreateGroupDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createGroupMutation = useCreateGroupMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const onSubmit = async (data: CreateGroupFormData) => {
    setIsSubmitting(true);
    try {
      const groupData: CreateGroupData = {
        title: data.title,
        description: data.description || undefined,
        telegram_channels: data.telegram_channels || undefined,
      };
      await createGroupMutation.mutateAsync(groupData);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>ایجاد گروه جدید</DialogTitle>
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
              {isSubmitting ? 'در حال ایجاد...' : 'ایجاد گروه'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog; 