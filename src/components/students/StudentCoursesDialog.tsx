import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { StudentCourseEnrollment } from '@/types/student';

interface StudentCoursesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  enrollments: StudentCourseEnrollment[];
}

export function StudentCoursesDialog({ open, onOpenChange, studentName, enrollments }: StudentCoursesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>دوره‌های {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {enrollments.map((enrollment, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{enrollment.course.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ترم: {enrollment.course_terms?.name || 'عمومی'}
                    </p>
                    <p className="text-sm text-gray-500">
                      تاریخ ثبت‌نام: {formatDate({dateString: enrollment.enrolled_at})}
                    </p>
                  </div>
                  <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                    {enrollment.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 