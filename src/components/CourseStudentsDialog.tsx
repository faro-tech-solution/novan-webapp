import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import StudentProfileModal from './StudentProfileModal';
import { accountingService } from '@/services/accountingService';
import { Tables } from '@/integrations/supabase/types';

type CourseEnrollment = Tables<'course_enrollments'> & {
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
};

interface CourseTerm {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

interface CourseStudentsDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled: boolean;
}

const CourseStudentsDialog = ({ courseId, isOpen, onClose }: CourseStudentsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [terms, setTerms] = useState<CourseTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStudentEmail, setAddStudentEmail] = useState('');
  const [selectedTermId, setSelectedTermId] = useState<string>('general');
  const [addingStudent, setAddingStudent] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const { toast } = useToast();
  const { profile } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<CourseEnrollment[]>([]);
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  // Only admins can delete students from courses
  const canDeleteStudents = profile?.role === 'admin';

  const fetchEnrollments = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          student_id,
          status,
          enrolled_at,
          term_id,
          created_at,
          updated_at,
          profiles:student_id (
            first_name,
            last_name,
            email
          )
        `)
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

  const fetchTerms = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from('course_terms')
        .select('*')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTerms(data || []);
    } catch (error) {
      console.error('Error fetching terms:', error);
    }
  };

  const fetchCoursePrice = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('price')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCoursePrice(data.price || 0);
    } catch (error: any) {
      console.error('Error fetching course price:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      // Fetch all students
      const { data: allStudents, error: studentsError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'trainee');

      if (studentsError) throw studentsError;

      // Fetch enrolled students
      const { data: enrolledData, error: enrolledError } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          student_id,
          status,
          enrolled_at,
          term_id,
          created_at,
          updated_at,
          profiles:student_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('course_id', courseId);

      if (enrolledError) throw enrolledError;

      setEnrolledStudents(enrolledData as CourseEnrollment[]);
      const enrolledIds = new Set(enrolledData.map(e => e.student_id));

      setStudents(allStudents.map(student => ({
        ...student,
        enrolled: enrolledIds.has(student.id)
      })));
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در دریافت لیست دانشجویان',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnrollments();
      fetchTerms();
      fetchCoursePrice();
      fetchStudents();
    }
  }, [isOpen, courseId]);

  const handleAddStudent = async () => {
    if (!addStudentEmail.trim()) {
      toast({
        title: 'خطا',
        description: 'لطفا ایمیل دانشجو را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    setAddingStudent(true);

    try {
      // First, try to find the user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', addStudentEmail.trim())
        .single();

      if (profileError || !profileData) {
        toast({
          title: 'خطا',
          description: 'کاربری با این ایمیل یافت نشد',
          variant: 'destructive',
        });
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', profileData.id)
        .single();

      if (existingEnrollment) {
        toast({
          title: 'خطا',
          description: 'این دانشجو قبلاً در این درس ثبت‌نام کرده است',
          variant: 'destructive',
        });
        return;
      }

      // Add student to course
      const enrollmentData = {
        course_id: courseId,
        student_id: profileData.id,
        status: 'active',
        ...(selectedTermId !== 'general' && { term_id: selectedTermId })
      };

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert([enrollmentData]);

      if (enrollmentError) throw enrollmentError;

      toast({
        title: 'موفق',
        description: 'دانشجو با موفقیت به درس اضافه شد',
      });

      // Refresh the list
      fetchEnrollments();
      fetchStudents();
      setShowAddForm(false);
      setAddStudentEmail('');
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در افزودن دانشجو',
        variant: 'destructive',
      });
    } finally {
      setAddingStudent(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string, studentFullName: string) => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: `${studentFullName} با موفقیت از درس حذف شد`,
      });

      fetchEnrollments();
    } catch (error) {
      console.error('Error removing student:', error);
      toast({
        title: 'خطا',
        description: 'خطا در حذف دانشجو',
        variant: 'destructive',
      });
    }
  };

  const handleViewProfile = (studentId: string, studentFullName: string) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentFullName);
    setShowProfileModal(true);
  };

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

  const getTermName = (termId: string | undefined) => {
    if (!termId) return 'عمومی';
    const term = terms.find(t => t.id === termId);
    return term ? term.name : 'نامشخص';
  };

  const filteredEnrollments = enrollments.filter(enrollment =>
    `${enrollment.profiles?.first_name} ${enrollment.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEnroll = async () => {
    if (!selectedStudent) {
      toast({
        title: 'خطا',
        description: 'لطفا ایمیل دانشجو را وارد کنید',
        variant: 'destructive',
      });
      return;
    }

    try {
      // First, find the student by email
      const { data: studentData, error: studentError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('email', selectedStudent.trim())
        .single();

      if (studentError || !studentData) {
        toast({
          title: 'خطا',
          description: 'دانشجویی با این ایمیل یافت نشد',
          variant: 'destructive',
        });
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('student_id', studentData.id)
        .single();

      if (existingEnrollment) {
        toast({
          title: 'خطا',
          description: 'این دانشجو قبلاً در این دوره ثبت‌نام کرده است',
          variant: 'destructive',
        });
        return;
      }

      const now = new Date().toISOString();

      // Create enrollment with just the essential fields
      const enrollmentData = {
        course_id: courseId,
        student_id: studentData.id,
        status: 'active',
        enrolled_at: now,
        term_id: selectedTermId === 'general' ? null : selectedTermId,
        created_at: now,
        updated_at: now
      };

      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert([enrollmentData]);

      if (enrollError) {
        console.error('Enrollment error:', enrollError);
        throw enrollError;
      }

      // Update student list
      setStudents(students.map(student => 
        student.id === studentData.id 
          ? { ...student, enrolled: true }
          : student
      ));

      toast({
        title: 'ثبت‌نام موفق',
        description: 'دانشجو با موفقیت در دوره ثبت‌نام شد',
      });

      setSelectedStudent('');
      fetchEnrollments(); // Refresh the enrollments list
    } catch (error: any) {
      console.error('Error in handleEnroll:', error);
      toast({
        title: 'خطا',
        description: error.message || 'خطا در ثبت‌نام دانشجو',
        variant: 'destructive',
      });
    }
  };

  const handleUnenroll = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .delete()
        .eq('course_id', courseId)
        .eq('student_id', studentId);

      if (error) throw error;

      // Update student list
      setStudents(students.map(student => 
        student.id === studentId 
          ? { ...student, enrolled: false }
          : student
      ));

      toast({
        title: 'حذف موفق',
        description: 'دانشجو با موفقیت از دوره حذف شد',
      });
    } catch (error: any) {
      toast({
        title: 'خطا',
        description: error.message || 'خطا در حذف دانشجو',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>مدیریت دانشجویان دوره</DialogTitle>
            <DialogDescription>
              دانشجویان را به دوره اضافه یا حذف کنید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>قیمت دوره</Label>
              <Input 
                type="number" 
                value={coursePrice} 
                onChange={(e) => setCoursePrice(Number(e.target.value))}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label>افزودن دانشجوی جدید</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  placeholder="ایمیل دانشجو را وارد کنید"
                  className="text-right"
                />
                <Button onClick={handleEnroll}>افزودن</Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>دانشجویان ثبت‌نام شده</Label>
              <div className="border rounded-md divide-y">
                {enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {enrollment.profiles?.first_name} {enrollment.profiles?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.profiles?.email}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnenroll(enrollment.student_id)}
                    >
                      حذف
                    </Button>
                  </div>
                ))}
                {enrollments.length === 0 && (
                  <div className="p-3 text-center text-gray-500">
                    هیچ دانشجویی در این دوره ثبت‌نام نشده است
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Profile Modal */}
      <StudentProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        studentId={selectedStudentId}
        studentName={selectedStudentName}
      />
    </>
  );
};

export default CourseStudentsDialog;
