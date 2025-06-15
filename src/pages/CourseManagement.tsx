
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
  instructor_id: string;
  instructor_name: string;
  status: string;
  max_students: number | null;
  created_at: string;
  student_count?: number;
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
        .select('*')
        .order('created_at', { ascending: false });

      // If user is trainer, only show their courses
      // If user is admin, show all courses
      if (profile.role === 'trainer') {
        query = query.eq('instructor_id', profile.id);
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

  // Determine if user can create courses (trainers can, admins cannot unless they're also trainers)
  const canCreateCourses = profile?.role === 'trainer';
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
      {selectedCourse && (
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
          open={showStudentsDialog}
          onOpenChange={setShowStudentsDialog}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        course={selectedCourse}
        onConfirmDelete={confirmDeleteCourse}
      />
    </DashboardLayout>
  );
};

export default CourseManagement;
