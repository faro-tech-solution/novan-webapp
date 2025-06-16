import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateCourseDialog from '@/components/CreateCourseDialog';
import EditCourseDialog from '@/components/EditCourseDialog';
import CourseStudentsDialog from '@/components/CourseStudentsDialog';
import CourseManagementHeader from '@/components/CourseManagementHeader';
import CourseGrid from '@/components/CourseGrid';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';
import TermsManagementModal from '@/components/TermsManagementModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Course {
  id: string;
  name: string;
  description: string | null;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
  price: number;
}

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchCourses = async () => {
    if (!profile) return;

    try {
      let query = supabase
        .from('courses')
        .select('id, name, description, status, max_students, created_at, price')
        .order('created_at', { ascending: false });

      // Admins see all courses, trainers only see assigned courses
      if (profile.role === 'admin') {
        // No additional filter needed for admins
      } else if (profile.role === 'trainer') {
        // Filter to only show assigned courses
        const { data: assignments } = await supabase
          .from('teacher_course_assignments')
          .select('course_id')
          .eq('teacher_id', profile.id);

        if (assignments && assignments.length > 0) {
          const assignedCourseIds = assignments.map(a => a.course_id);
          query = query.in('id', assignedCourseIds);
        } else {
          // No assignments, return empty array
          setCourses([]);
          return;
        }
      }

      const { data: coursesData, error: coursesError } = await query;

      if (coursesError) throw coursesError;

      // Get enrollment counts for each course
      const coursesWithCounts = await Promise.all(
        (coursesData || []).map(async (course) => {
          const { count } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)
            .eq('status', 'active');

          return {
            ...course,
            student_count: count || 0,
          };
        })
      );

      setCourses(coursesWithCounts);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'خطا',
        description: 'خطا در بارگذاری درس‌ها',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCourses();
      setLoading(false);
    };

    if (profile) {
      loadData();
    }
  }, [profile]);

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowEditDialog(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const handleManageTerms = (course: Course) => {
    setSelectedCourse(course);
    setShowTermsDialog(true);
  };

  const handleViewStudents = (course: Course) => {
    setSelectedCourse(course);
    setShowStudentsDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;

    // Check if course has students
    if (selectedCourse.student_count && selectedCourse.student_count > 0) {
      toast({
        title: 'خطا',
        description: 'نمی‌توانید درسی را که دانشجو دارد حذف کنید',
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', selectedCourse.id);

      if (error) throw error;

      toast({
        title: 'موفقیت',
        description: 'درس با موفقیت حذف شد',
      });

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: 'خطا',
        description: 'خطا در حذف درس',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedCourse(null);
    }
  };

  const handleCourseCreated = () => {
    fetchCourses();
  };

  const handleCourseUpdated = () => {
    fetchCourses();
  };

  // Only admins can create courses
  const canCreateCourses = profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  if (loading) {
    return (
      <DashboardLayout title={isAdmin ? 'مدیریت درس‌ها' : 'مدیریت درس‌ها'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isAdmin ? 'مدیریت درس‌ها' : 'مدیریت درس‌ها'}>
      <div className="space-y-6">
        {/* Header */}
        <CourseManagementHeader
          isAdmin={isAdmin}
          canCreateCourses={canCreateCourses}
          onCreateCourse={() => setShowCreateDialog(true)}
        />

        {/* Courses Grid */}
        <CourseGrid
          courses={courses}
          userRole={profile?.role}
          userId={profile?.id}
          canCreateCourses={canCreateCourses}
          isAdmin={isAdmin}
          onCreateCourse={() => setShowCreateDialog(true)}
          onManageTerms={handleManageTerms}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          onViewStudents={handleViewStudents}
        />

        {/* Terms Management Modal */}
        <TermsManagementModal
          open={showTermsDialog}
          onClose={() => setShowTermsDialog(false)}
          course={selectedCourse}
          userRole={profile?.role}
        />
      </div>

      {/* Create Course Dialog */}
      {canCreateCourses && (
        <CreateCourseDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {/* Edit Course Dialog */}
      {selectedCourse && isAdmin && (
        <EditCourseDialog 
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          course={selectedCourse}
          onCourseUpdated={handleCourseUpdated}
        />
      )}

      {/* Students Dialog */}
      {selectedCourse && (
        <CourseStudentsDialog
          isOpen={showStudentsDialog}
          onClose={() => setShowStudentsDialog(false)}
          courseId={selectedCourse.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isAdmin && (
        <ConfirmDeleteDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          course={selectedCourse}
          onConfirmDelete={confirmDeleteCourse}
        />
      )}
    </DashboardLayout>
  );
};

export default CourseManagement;
