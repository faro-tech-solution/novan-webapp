import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    courseName: string;
    joinDate: string;
    status: string;
    completedExercises: number;
    totalExercises: number;
    averageScore: number;
    lastActivity: string;
    totalPoints: number;
    termName?: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
    phone?: string;
    address?: string;
    bio?: string;
    avatar_url?: string;
    gender?: string;
    education?: string;
  } | null;
}

const educationLevels = [
  { value: 'diploma', label: 'دیپلم' },
  { value: 'associate', label: 'کاردانی' },
  { value: 'bachelor', label: 'کارشناسی' },
  { value: 'master', label: 'کارشناسی ارشد' },
  { value: 'phd', label: 'دکترا' },
  { value: 'other', label: 'سایر' }
];

const genders = [
  { value: 'male', label: 'مرد' },
  { value: 'female', label: 'زن' },
  { value: 'other', label: 'سایر' }
];

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
                  <div className="text-sm text-gray-500">ترم</div>
                  <div className="font-medium">{student.termName || 'نامشخص'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">تاریخ ثبت‌نام</div>
                  <div className="font-medium">{formatDate(student.joinDate)}</div>
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
                  <div className="font-medium">{student.created_at ? formatDate(student.created_at) : 'نامشخص'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">آخرین بروزرسانی</div>
                  <div className="font-medium">{student.updated_at ? formatDate(student.updated_at) : 'نامشخص'}</div>
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