import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, Award, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { StudentProfile, StudentEnrollment } from '@/types/student';

interface StudentProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
}

const StudentProfileModal = ({ open, onOpenChange, studentId, studentName }: StudentProfileModalProps) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [loading, setLoading] = useState(false);
  const [profileNotFound, setProfileNotFound] = useState(false);
  const { toast } = useToast();

  const fetchStudentProfile = async () => {
    if (!studentId) return;

    setLoading(true);
    setProfileNotFound(false);
    try {
      // Fetch student profile using maybeSingle() to handle cases where profile doesn't exist
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.log('No profile found for student ID:', studentId);
        setProfileNotFound(true);
        setProfile(null);
      } else {
        setProfile(profileData);
      }

      // Fetch student enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses!inner(name),
          course_terms(name)
        `)
        .eq('student_id', studentId);

      if (enrollmentError) throw enrollmentError;

      const transformedEnrollments = (enrollmentData || []).map(enrollment => ({
        course_name: enrollment.courses?.name || 'نامشخص',
        enrolled_at: enrollment.enrolled_at,
        status: enrollment.status,
        term_name: enrollment.course_terms?.name
      }));

      setEnrollments(transformedEnrollments);

    } catch (error) {
      console.error('Error fetching student profile:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری پروفایل دانشجو',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && studentId) {
      fetchStudentProfile();
    }
  }, [open, studentId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'inactive': return 'غیرفعال';
      case 'completed': return 'تکمیل شده';
      default: return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>پروفایل دانشجو: {studentName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">در حال بارگذاری...</div>
          </div>
        ) : profileNotFound ? (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">پروفایل کاملی برای این دانشجو یافت نشد</p>
                  <p className="text-sm text-gray-400">نام: {studentName}</p>
                  <p className="text-sm text-gray-400">شناسه: {studentId}</p>
                </div>
              </CardContent>
            </Card>

            {/* Course Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  دوره‌های ثبت‌نام شده ({enrollments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">در هیچ دوره‌ای ثبت‌نام نکرده</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{enrollment.course_name}</h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mt-1">
                            <span>ترم: {enrollment.term_name || 'عمومی'}</span>
                            <span>تاریخ ثبت‌نام: {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(enrollment.status)}>
                          {getStatusText(enrollment.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  اطلاعات شخصی
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">نام</label>
                    <p className="text-lg font-medium">{profile.first_name && profile.last_name ? `${profile.first_name} ${profile.last_name}` : 'نامشخص'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">ایمیل</label>
                    <p className="text-lg">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">نقش</label>
                    <Badge variant="outline">{profile.role}</Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">کلاس</label>
                    <p className="text-lg">{profile.class_name || 'تعیین نشده'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">تاریخ عضویت</label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      <p>{new Date(profile.created_at).toLocaleDateString('fa-IR')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  دوره‌های ثبت‌نام شده ({enrollments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">در هیچ دوره‌ای ثبت‌نام نکرده</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{enrollment.course_name}</h4>
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500 mt-1">
                            <span>ترم: {enrollment.term_name || 'عمومی'}</span>
                            <span>تاریخ ثبت‌نام: {new Date(enrollment.enrolled_at).toLocaleDateString('fa-IR')}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(enrollment.status)}>
                          {getStatusText(enrollment.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats (Mock data for now) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  آمار عملکرد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{Math.floor(Math.random() * 20) + 5}</div>
                    <div className="text-sm text-gray-600">تمرین تکمیل شده</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 30) + 70}%</div>
                    <div className="text-sm text-gray-600">میانگین نمره</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 1000) + 500}</div>
                    <div className="text-sm text-gray-600">امتیاز کل</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default StudentProfileModal;
