import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { StudentDetails } from '@/types/student';

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDetails | null;
}

export function StudentDetailsDialog({ open, onOpenChange, student }: StudentDetailsDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>جزئیات دانشجو</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات پایه</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">نام و نام خانوادگی</div>
                  <div className="font-medium">{student.first_name} {student.last_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">ایمیل</div>
                  <div className="font-medium">{student.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">جنسیت</div>
                  <div className="font-medium">{student.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">تحصیلات</div>
                  <div className="font-medium">{student.education}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">دوره</div>
                  <div className="font-medium">{student.courseName}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">تاریخ ثبت‌نام</div>
                  <div className="font-medium">{formatDate({dateString: student.joinDate})}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">وضعیت</div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-500">نقش</div>
                  <div className="font-medium">{student.role || 'دانشجو'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">تاریخ ایجاد</div>
                  <div className="font-medium">{student.created_at ? formatDate({dateString: student.created_at}) : 'نامشخص'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">آخرین بروزرسانی</div>
                  <div className="font-medium">{student.updated_at ? formatDate({dateString: student.updated_at}) : 'نامشخص'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          {student.bio && (
            <Card>
              <CardHeader>
                <CardTitle>درباره دانشجو</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{student.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 