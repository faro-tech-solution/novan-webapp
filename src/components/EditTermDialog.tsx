
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseTerm {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  max_students: number;
}

interface EditTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  term: CourseTerm | null;
  onTermUpdated: () => void;
}

const EditTermDialog = ({ open, onOpenChange, term, onTermUpdated }: EditTermDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: '',
    max_students: 0,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (term) {
      setFormData({
        name: term.name,
        start_date: term.start_date || '',
        end_date: term.end_date || '',
        max_students: term.max_students,
      });
    }
  }, [term]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term) return;

    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        max_students: formData.max_students,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('course_terms')
        .update(updateData)
        .eq('id', term.id);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'ترم با موفقیت به‌روزرسانی شد',
      });

      onTermUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating term:', error);
      toast({
        title: 'خطا',
        description: 'خطا در به‌روزرسانی ترم',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ویرایش ترم</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">نام ترم *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: ترم بهار 1403"
              required
            />
          </div>

          <div>
            <Label htmlFor="start_date">تاریخ شروع</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="end_date">تاریخ پایان</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="max_students">حداکثر تعداد دانشجو (0 برای نامحدود)</Label>
            <Input
              id="max_students"
              type="number"
              min="0"
              value={formData.max_students}
              onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              لغو
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTermDialog;
