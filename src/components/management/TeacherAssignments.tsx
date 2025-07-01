import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CourseTerm } from '@/types/course';
import { TeacherAssignment } from '@/types/instructor';

interface Course {
  id: string;
  name: string;
  description: string | null;
}

interface TeacherAssignmentsProps {
  teacherId: string;
  teacherName: string;
  open: boolean;
  onClose: () => void;
}

const TeacherAssignments = ({ teacherId, teacherName, open, onClose }: TeacherAssignmentsProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [terms, setTerms] = useState<CourseTerm[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment>({
    course_ids: [],
    term_ids: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    if (!open || !teacherId) return;

    try {
      setLoading(true);

      // Fetch all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, name, description')
        .order('name');

      if (coursesError) throw coursesError;

      // Fetch all terms with course names
      const { data: termsData, error: termsError } = await supabase
        .from('course_terms')
        .select(`
          id,
          name,
          course_id,
          start_date,
          end_date,
          courses!inner(name)
        `)
        .order('name');

      if (termsError) throw termsError;

      // Fetch current assignments
      const [courseAssignments, termAssignments] = await Promise.all([
        supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', teacherId),
        supabase
          .from('teacher_term_assignments')
          .select('term_id')
          .eq('teacher_id', teacherId)
      ]);

      setCourses(coursesData || []);
      const processedTermsData = termsData.map(term => ({
        id: term.id,
        name: term.name,
        course_id: term.course_id,
        course_name: term.courses.name,
        start_date: term.start_date,
        end_date: term.end_date,
        max_students: 0 // Default value since it's not in the query
      }));
      setTerms(processedTermsData);

      setAssignments({
        course_ids: courseAssignments.data?.map(a => a.course_id) || [],
        term_ids: termAssignments.data?.map(a => a.term_id) || []
      });

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری اطلاعات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Get current user for assigned_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete existing assignments
      await Promise.all([
        supabase
          .from('teacher_course_assignments')
          .delete()
          .eq('teacher_id', teacherId),
        supabase
          .from('teacher_term_assignments')
          .delete()
          .eq('teacher_id', teacherId)
      ]);

      // Insert new course assignments
      if (assignments.course_ids.length > 0) {
        const courseAssignmentsData = assignments.course_ids.map(courseId => ({
          teacher_id: teacherId,
          course_id: courseId,
          assigned_by: user.id
        }));

        const { error: courseError } = await supabase
          .from('teacher_course_assignments')
          .insert(courseAssignmentsData);

        if (courseError) throw courseError;
      }

      // Insert new term assignments
      if (assignments.term_ids.length > 0) {
        const termAssignmentsData = assignments.term_ids.map(termId => ({
          teacher_id: teacherId,
          term_id: termId,
          assigned_by: user.id
        }));

        const { error: termError } = await supabase
          .from('teacher_term_assignments')
          .insert(termAssignmentsData);

        if (termError) throw termError;
      }

      toast({
        title: 'موفقیت',
        description: 'دسترسی‌های مربی با موفقیت تغییر کرد',
      });

      onClose();

    } catch (error) {
      console.error('Error saving assignments:', error);
      toast({
        title: 'خطا',
        description: 'خطا در ذخیره تغییرات',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCourseToggle = (courseId: string, checked: boolean) => {
    setAssignments(prev => ({
      ...prev,
      course_ids: checked 
        ? [...prev.course_ids, courseId]
        : prev.course_ids.filter(id => id !== courseId)
    }));
  };

  const handleTermToggle = (termId: string, checked: boolean) => {
    setAssignments(prev => ({
      ...prev,
      term_ids: checked 
        ? [...prev.term_ids, termId]
        : prev.term_ids.filter(id => id !== termId)
    }));
  };

  useEffect(() => {
    fetchData();
  }, [open, teacherId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold">تنظیم دسترسی‌های {teacherName}</h2>
              <p className="text-gray-600">انتخاب درس‌ها و ترم‌هایی که مربی به آنها دسترسی دارد</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              بستن
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-lg">در حال بارگذاری...</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Course Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">دسترسی به درس‌ها</CardTitle>
                  <CardDescription>
                    انتخاب درس‌هایی که مربی می‌تواند مشاهده کند
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={assignments.course_ids.includes(course.id)}
                          onCheckedChange={(checked) => 
                            handleCourseToggle(course.id, !!checked)
                          }
                        />
                        <label 
                          htmlFor={`course-${course.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {course.name}
                        </label>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-gray-500 text-sm">هنوز درسی ایجاد نشده</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Term Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">دسترسی به ترم‌ها</CardTitle>
                  <CardDescription>
                    انتخاب ترم‌هایی که مربی می‌تواند مشاهده کند
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {terms.map((term) => (
                      <div key={term.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                          id={`term-${term.id}`}
                          checked={assignments.term_ids.includes(term.id)}
                          onCheckedChange={(checked) => 
                            handleTermToggle(term.id, !!checked)
                          }
                        />
                        <label 
                          htmlFor={`term-${term.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {term.name}
                          <span className="text-gray-500 text-xs block">
                            درس: {term.course_name}
                          </span>
                        </label>
                      </div>
                    ))}
                    {terms.length === 0 && (
                      <p className="text-gray-500 text-sm">هنوز ترمی ایجاد نشده</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end space-x-2 space-x-reverse mt-6">
            <Button variant="outline" onClick={onClose}>
              لغو
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || loading}
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
