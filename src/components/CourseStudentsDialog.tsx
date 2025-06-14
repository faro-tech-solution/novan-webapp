
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseEnrollment {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  enrolled_at: string;
  status: string;
}

interface CourseStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
}

const CourseStudentsDialog = ({ open, onOpenChange, courseId, courseName }: CourseStudentsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchEnrollments = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .order('enrolled_at', { ascending: false });

      if (error) throw error;

      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری ثبت‌نام‌ها',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && courseId) {
      fetchEnrollments();
    }
  }, [open, courseId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'inactive': return 'غیرفعال';
      default: return status;
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>دانشجویان درس {courseName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجوی دانشجویان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-lg">در حال بارگذاری...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>ایمیل</TableHead>
                  <TableHead>تاریخ ثبت‌نام</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium">{enrollment.student_name}</TableCell>
                    <TableCell>{enrollment.student_email}</TableCell>
                    <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(enrollment.status)}>
                        {getStatusText(enrollment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        مشاهده پروفایل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEnrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      {searchTerm ? 'هیچ دانشجویی یافت نشد' : 'هنوز دانشجویی ثبت‌نام نکرده'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseStudentsDialog;
