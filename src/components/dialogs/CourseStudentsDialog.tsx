import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tables } from "@/integrations/supabase/types";

type CourseEnrollment = Tables<"course_enrollments"> & {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
};

interface CourseStudentsDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const CourseStudentsDialog = ({
  courseId,
  isOpen,
  onClose,
}: CourseStudentsDialogProps) => {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const { toast } = useToast();
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [courseName, setCourseName] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fetchEnrollments = async () => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("course_enrollments")
        .select(
          `
          id,
          course_id,
          student_id,
          status,
          enrolled_at,
          term_id,
          created_at,
          updated_at,
          profiles!student_id (
            id,
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      const enrollmentsData = data || [];
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری ثبت‌نام‌ها",
        variant: "destructive",
      });
    } 
  };

  const fetchCoursePrice = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("price, name")
        .eq("id", courseId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setCoursePrice(data.price || 0);
        setCourseName(data.name || "");
      } else {
        console.warn("Course not found:", courseId);
        setCoursePrice(0);
        setCourseName("");
      }
    } catch (error: any) {
      console.error("Error fetching course price:", error);
      setCoursePrice(0);
      setCourseName("");
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEnrollments();
      fetchCoursePrice();
    }
  }, [isOpen, courseId]);

  const handleEnroll = async () => {
    if (!selectedStudent) {
      toast({
        title: "خطا",
        description: "لطفا ایمیل دانشجو را وارد کنید",
        variant: "destructive",
      });
      return;
    }

    try {
      // First, find the student by email
      const { data: studentData, error: studentError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("email", selectedStudent.trim())
        .single();

      if (studentError || !studentData) {
        toast({
          title: "خطا",
          description: "دانشجویی با این ایمیل یافت نشد",
          variant: "destructive",
        });
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollments, error: enrollmentCheckError } =
        await supabase
          .from("course_enrollments")
          .select("*")
          .eq("course_id", courseId)
          .eq("student_id", studentData.id);

      if (enrollmentCheckError) {
        console.error(
          "Error checking existing enrollment:",
          enrollmentCheckError
        );
      }

      // If we found any enrollments, the student is already enrolled
      if (existingEnrollments && existingEnrollments.length > 0) {
        toast({
          title: "خطا",
          description: "این دانشجو قبلاً در این دوره ثبت‌نام کرده است",
          variant: "destructive",
        });
        return;
      }

      const now = new Date().toISOString();

      // Create enrollment without price field - we'll handle pricing in accounting
      const enrollmentData = {
        course_id: courseId,
        student_id: studentData.id,
        status: "active",
        enrolled_at: now,
        term_id: null,
        created_at: now,
        updated_at: now,
      };

      const { error: enrollError } = await supabase
        .from("course_enrollments")
        .insert([enrollmentData]);

      if (enrollError) {
        console.error("Enrollment error:", enrollError);
        throw enrollError;
      }

      // Create accounting record for the course enrollment if price is set
      if (coursePrice > 0) {
        // Create accounting record for the course fee - using negative amount
        const accountingData = {
          user_id: studentData.id,
          course_id: courseId,
          amount: -coursePrice, // Use NEGATIVE price for what user owes
          payment_type: "buy_course" as const,
          payment_status: "waiting" as const, // Set initial status to waiting
          description: `ثبت نام در دوره ${courseName || String(courseId)}`,
        };

        const { error: accountingError } = await supabase
          .from("accounting")
          .insert([accountingData]);

        if (accountingError) {
          console.error("Accounting error:", accountingError);
          // Don't throw error here, just log it and continue
        }
      }

      toast({
        title: "ثبت‌نام موفق",
        description:
          coursePrice > 0
            ? "دانشجو با موفقیت در دوره ثبت‌نام شد و سند حسابداری ایجاد شد"
            : "دانشجو با موفقیت در دوره ثبت‌نام شد",
      });

      setSelectedStudent("");
      fetchEnrollments(); // Refresh the enrollments list
    } catch (error: any) {
      console.error("Error in handleEnroll:", error);
      toast({
        title: "خطا",
        description: error.message || "خطا در ثبت‌نام دانشجو",
        variant: "destructive",
      });
    }
  };

  // Open confirmation dialog before unenrolling
  const confirmUnenroll = (studentId: string, studentName: string) => {
    setStudentToRemove({ id: studentId, name: studentName });
    setShowDeleteConfirm(true);
  };

  // Actually perform the unenroll action after confirmation
  const handleUnenroll = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from("course_enrollments")
        .delete()
        .eq("course_id", courseId)
        .eq("student_id", studentId);

      if (error) throw error;

      toast({
        title: "حذف موفق",
        description: "دانشجو با موفقیت از دوره حذف شد",
      });

      fetchEnrollments(); // Refresh the enrollments list
    } catch (error: any) {
      toast({
        title: "خطا",
        description: error.message || "خطا در حذف دانشجو",
        variant: "destructive",
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
              <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-3 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {enrollment.profiles?.first_name}{" "}
                        {enrollment.profiles?.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.profiles?.email}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        confirmUnenroll(
                          enrollment.student_id,
                          `${enrollment.profiles?.first_name || ""} ${
                            enrollment.profiles?.last_name || ""
                          }`
                        )
                      }
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف دانشجو</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید{" "}
              {studentToRemove?.name || "این دانشجو"} را از دوره حذف کنید؟ این
              عمل قابل بازگشت نیست و ممکن است بر سوابق مالی دوره تأثیر بگذارد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (studentToRemove) {
                  handleUnenroll(studentToRemove.id);
                  setStudentToRemove(null);
                }
              }}
            >
              بله، حذف شود
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CourseStudentsDialog;
