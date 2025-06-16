import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  student_email: string;
  enrolled_at: string;
  status: string;
  term_id?: string;
}

interface CourseTerm {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
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
  const [terms, setTerms] = useState<CourseTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addStudentEmail, setAddStudentEmail] = useState('');
  const [selectedTermId, setSelectedTermId] = useState<string>('general');
  const [addingStudent, setAddingStudent] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const { toast } = useToast();
  const { profile } = useAuth();

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
          first_name,
          last_name,
          student_email,
          enrolled_at,
          status,
          term_id
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

  useEffect(() => {
    if (open && courseId) {
      fetchEnrollments();
      fetchTerms();
    }
  }, [open, courseId]);

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
        first_name: profileData.first_name || 'نام',
        last_name: profileData.last_name || 'نامشخص',
        student_email: profileData.email,
        status: 'active',
        ...(selectedTermId !== 'general' && { term_id: selectedTermId })
      };

      const { error: enrollmentError } = await supabase
        .from('course_enrollments')
        .insert([enrollmentData]);

      if (enrollmentError) throw enrollmentError;

      toast({
        title: 'موفقیت',
        description: 'دانشجو با موفقیت به درس اضافه شد',
      });

      // Reset form and refresh data
      setAddStudentEmail('');
      setSelectedTermId('general');
      setShowAddForm(false);
      fetchEnrollments();

    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: 'خطا',
        description: 'خطا در افزودن دانشجو',
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
    `${enrollment.first_name} ${enrollment.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>دانشجویان {courseName}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="جستجو..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 ml-2" />
              افزودن دانشجو
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام</TableHead>
                  <TableHead className="text-right">ایمیل</TableHead>
                  <TableHead className="text-right">ترم</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell className="font-medium text-right">
                      {`${enrollment.first_name} ${enrollment.last_name}`}
                    </TableCell>
                    <TableCell className="text-right">{enrollment.student_email}</TableCell>
                    <TableCell className="text-right">{getTermName(enrollment.term_id)}</TableCell>
                    <TableCell className="text-right">
                      <Badge className={getStatusColor(enrollment.status)}>
                        {getStatusText(enrollment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProfile(enrollment.student_id, `${enrollment.first_name} ${enrollment.last_name}`)}
                        >
                          <Eye className="h-3 w-3 ml-2" />
                          مشاهده
                        </Button>
                        {canDeleteStudents && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3 ml-2" />
                                حذف
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف دانشجو</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا مطمئن هستید که می‌خواهید {`${enrollment.first_name} ${enrollment.last_name}`} را از این درس حذف کنید؟
                                  این عمل قابل برگشت نیست.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>لغو</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveStudent(enrollment.id, `${enrollment.first_name} ${enrollment.last_name}`)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Add Student Form */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">افزودن دانشجو</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showAddForm ? 'بستن' : 'افزودن دانشجو'}
                </Button>
              </div>
            </CardHeader>
            {showAddForm && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="studentEmail">ایمیل دانشجو</Label>
                    <Input
                      id="studentEmail"
                      type="email"
                      placeholder="example@email.com"
                      value={addStudentEmail}
                      onChange={(e) => setAddStudentEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="termSelect">ترم (اختیاری)</Label>
                    <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب ترم" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">عمومی (بدون ترم)</SelectItem>
                        {terms.map((term) => (
                          <SelectItem key={term.id} value={term.id}>
                            {term.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={handleAddStudent}
                      disabled={addingStudent}
                      className="w-full"
                    >
                      {addingStudent ? 'در حال افزودن...' : 'افزودن دانشجو'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
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
