import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CourseStudentsDialog from "@/components/dialogs/CourseStudentsDialog";
import ExerciseCategoriesDialog from "@/components/dialogs/ExerciseCategoriesDialog";
import CourseManagementHeader from "@/components/courses/CourseManagementHeader";
import CourseGrid from "@/components/courses/CourseGrid";
import ConfirmDeleteDialog from "@/components/dialogs/ConfirmDeleteDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCoursesQuery } from "@/hooks/queries/useCoursesQuery";
import { Course } from "@/types/course";

const CourseManagement = () => {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStudentsDialog, setShowStudentsDialog] = useState(false);
  const [showCategoriesDialog, setShowCategoriesDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();
  const { courses, loading, error, deleteCourse } = useCoursesQuery();

  const handleCreateCourse = () => {
    router.push('/portal/admin/courses-management/create');
  };

  const handleEditCourse = (course: Course) => {
    router.push(`/portal/admin/courses-management/${course.id}`);
  };

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };



  const handleViewStudents = (course: Course) => {
    setSelectedCourse(course);
    setShowStudentsDialog(true);
  };

  const handleManageCategories = (course: Course) => {
    setSelectedCourse(course);
    setShowCategoriesDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;

    // Check if course has students
    if (selectedCourse.student_count && selectedCourse.student_count > 0) {
      toast({
        title: "خطا",
        description: "نمی‌توانید درسی را که دانشجو دارد حذف کنید",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      return;
    }

    try {
      await deleteCourse(selectedCourse.id);
      toast({
        title: "موفقیت",
        description: "درس با موفقیت حذف شد",
      });
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "خطا",
        description: "خطا در حذف درس",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedCourse(null);
    }
  };

  // Only admins can create courses
  const canCreateCourses = profile?.role === "admin";
  const isAdmin = profile?.role === "admin";

  if (loading) {
    return (
      <DashboardLayout title={isAdmin ? "مدیریت درس‌ها" : "مدیریت درس‌ها"}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title={isAdmin ? "مدیریت درس‌ها" : "مدیریت درس‌ها"}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">خطا در بارگذاری درس‌ها</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={isAdmin ? "مدیریت درس‌ها" : "مدیریت درس‌ها"}>
      <div className="space-y-6">
        {/* Header */}
        <CourseManagementHeader
          isAdmin={isAdmin}
          canCreateCourses={canCreateCourses}
          onCreateCourse={handleCreateCourse}
        />

        {/* Courses Grid */}
        <CourseGrid
          courses={courses as any}
          userRole={profile?.role}
          userId={profile?.id}
          canCreateCourses={canCreateCourses}
          isAdmin={isAdmin}
          onCreateCourse={handleCreateCourse}
          onManageCategories={handleManageCategories}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          onViewStudents={handleViewStudents}
        />
      </div>

      {/* Students Dialog */}
      {selectedCourse && (
        <CourseStudentsDialog
          isOpen={showStudentsDialog}
          onClose={() => setShowStudentsDialog(false)}
          courseId={selectedCourse.id}
        />
      )}

      {/* Exercise Categories Dialog */}
      {selectedCourse && (
        <ExerciseCategoriesDialog
          open={showCategoriesDialog}
          onOpenChange={setShowCategoriesDialog}
          courseId={selectedCourse.id}
          courseName={selectedCourse.name}
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
