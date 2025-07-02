import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { GradingSection } from "@/components/exercises/GradingSection";
import { SubmissionViewer } from "@/components/exercises/SubmissionViewer";
import {
  useSubmissionsQuery,
  useCoursesForReviewQuery,
  useGradeSubmissionMutation,
} from "@/hooks/queries/useReviewSubmissionsQuery";
import { Submission } from "@/types/reviewSubmissions";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useExercisesQuery } from "@/hooks/queries/useExercisesQuery";
import { Checkbox } from "@/components/ui/checkbox";
import UserNameWithBadge from "@/components/ui/UserNameWithBadge";
import { useStudentsQuery } from "@/hooks/queries/useStudentsQuery";

const ReviewSubmissions = () => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "reviewed" | "all"
  >("pending");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [showNoSubmission, setShowNoSubmission] = useState(false);

  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useSubmissionsQuery();
  const { data: courses = [] } = useCoursesForReviewQuery();
  const { exercises = [], loading: exercisesLoading } = useExercisesQuery();
  const gradeSubmissionMutation = useGradeSubmissionMutation();
  const { students: allStudents = [] } = useStudentsQuery();

  const handleGradingComplete = async () => {
    if (!selectedSubmission) return;

    try {
      await gradeSubmissionMutation.mutateAsync({
        submissionId: selectedSubmission.id,
        score: score ? parseInt(score) : null,
        feedback: feedback || null,
      });

      toast({
        title: "نمره‌دهی انجام شد",
        description: "نمره و بازخورد با موفقیت ثبت شد",
      });

      setIsDialogOpen(false);
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
    } catch (err: any) {
      toast({
        title: "خطا",
        description: err.message || "خطا در ثبت نمره",
        variant: "destructive",
      });
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score?.toString() || "");
    setFeedback(submission.feedback || "");
    setIsDialogOpen(true);
  };

  // Helper to get course name by course_id
  const getCourseName = (course_id: string | undefined) => {
    if (!course_id) return "---";
    const course = courses.find((c) => c.id === course_id);
    return course ? course.name : "---";
  };

  const filteredSubmissions = submissions.filter((submission) => {
    // Status filter
    if (statusFilter === "pending" && submission.score !== null) return false;
    if (statusFilter === "reviewed" && submission.score === null) return false;
    // Course filter
    if (
      selectedCourse !== "all" &&
      submission.exercise?.course_id !== selectedCourse
    )
      return false;
    // Exercise filter
    if (
      selectedExercise !== "all" &&
      submission.exercise?.id !== selectedExercise
    )
      return false;
    // Demo user filter
    if (showDemoUsers) {
      if (!submission.student?.is_demo) return false;
    } else {
      if (submission.student?.is_demo) return false;
    }
    // Search filter
    return (
      `${submission.student?.first_name} ${submission.student?.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      submission.student?.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (submission.exercise?.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getCourseName(submission.exercise?.course_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // Find students who have NOT submitted for the current filters
  let studentsWithNoSubmission: typeof allStudents = [];
  if (showNoSubmission) {
    // Get filtered student IDs who have submitted
    let relevantSubmissions = submissions;
    // Apply course filter to submissions
    if (selectedCourse !== "all") {
      relevantSubmissions = relevantSubmissions.filter(
        (s) => s.exercise?.course_id === selectedCourse
      );
    }
    // Apply exercise filter to submissions
    if (selectedExercise !== "all") {
      relevantSubmissions = relevantSubmissions.filter(
        (s) => s.exercise?.id === selectedExercise
      );
    }
    // Demo user filter for submissions
    if (showDemoUsers) {
      relevantSubmissions = relevantSubmissions.filter(
        (s) => s.student?.is_demo
      );
    } else {
      relevantSubmissions = relevantSubmissions.filter(
        (s) => !s.student?.is_demo
      );
    }
    const submittedStudentIds = new Set(
      relevantSubmissions.map((s) => s.student_id)
    );
    studentsWithNoSubmission = allStudents.filter((student) => {
      // Course filter: must be enrolled in the selected course
      if (selectedCourse !== "all") {
        const enrolled = student.course_enrollments?.some(
          (e) =>
            e.course?.name &&
            courses.find((c) => c.id === selectedCourse)?.name ===
              e.course?.name
        );
        if (!enrolled) return false;
      }
      // Demo user filter
      if (showDemoUsers) {
        if (!student.is_demo) return false;
      } else {
        if (student.is_demo) return false;
      }
      // Only those who have NOT submitted for the relevant exercise/course
      return !submittedStudentIds.has(student.id);
    });
  }

  return (
    <DashboardLayout title="بررسی تمرین‌های ارسالی">
      <Card>
        <CardHeader>
          <CardTitle>لیست تمرین‌های ارسالی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:space-x-4 md:space-x-reverse gap-2">
            <Input
              placeholder="جستجو بر اساس نام دانشجو، ایمیل، عنوان تمرین یا نام دوره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as any)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">در انتظار بررسی</SelectItem>
                <SelectItem value="reviewed">بررسی شده</SelectItem>
                <SelectItem value="all">همه</SelectItem>
              </SelectContent>
            </Select>
            {/* Course Filter */}
            <Select
              value={selectedCourse}
              onValueChange={(v) => {
                setSelectedCourse(v);
                setSelectedExercise("all");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="انتخاب دوره" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دوره‌ها</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Exercise Filter */}
            <Select
              value={selectedExercise}
              onValueChange={(v) => setSelectedExercise(v)}
              disabled={selectedCourse === "all" || exercisesLoading}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="انتخاب تمرین" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه تمرین‌ها</SelectItem>
                {exercises
                  .filter(
                    (ex) =>
                      selectedCourse === "all" ||
                      ex.course_id === selectedCourse
                  )
                  .map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="show-demo-users"
                checked={showDemoUsers}
                onCheckedChange={(v) => setShowDemoUsers(v === true)}
              />
              <label
                htmlFor="show-demo-users"
                className="text-sm cursor-pointer select-none"
              >
                نمایش کاربران آزمایشی
              </label>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="show-no-submission"
                checked={showNoSubmission}
                onCheckedChange={(v) => setShowNoSubmission(v === true)}
              />
              <label
                htmlFor="show-no-submission"
                className="text-sm cursor-pointer select-none"
              >
                کاربرانی که تمرین نکرده اند
              </label>
            </div>
          </div>

          {submissionsLoading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : submissionsError ? (
            <div className="text-center py-4 text-red-500">
              {submissionsError instanceof Error
                ? submissionsError.message
                : "خطا در دریافت اطلاعات"}
            </div>
          ) : showNoSubmission ? (
            studentsWithNoSubmission.length === 0 ? (
              <div className="text-center py-4">
                همه دانشجویان برای این فیلتر تمرین ارسال کرده‌اند
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">دانشجو</TableHead>
                    <TableHead className="text-right">ایمیل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsWithNoSubmission.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <UserNameWithBadge
                          firstName={student.first_name}
                          lastName={student.last_name}
                          isDemo={student.is_demo}
                        />
                      </TableCell>
                      <TableCell>{student.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">
              هیچ تمرینی برای بررسی وجود ندارد
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">دانشجو</TableHead>
                    <TableHead className="text-right">تمرین</TableHead>
                    <TableHead className="text-right">تاریخ ارسال</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <UserNameWithBadge
                          firstName={submission.student?.first_name || ""}
                          lastName={submission.student?.last_name || ""}
                          isDemo={submission.student?.is_demo}
                        />
                        <label className="block text-sm text-gray-400">
                          {submission.student?.email}
                        </label>
                      </TableCell>
                      <TableCell>
                        <label className="block">
                          {submission.exercise?.title || "---"}
                        </label>
                        <label className="block text-sm text-gray-400">
                          {getCourseName(submission.exercise?.course_id)}
                        </label>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submitted_at).toLocaleDateString(
                          "fa-IR"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            submission.score !== null ? "default" : "secondary"
                          }
                        >
                          {submission.score !== null
                            ? "بررسی شده"
                            : "در انتظار بررسی"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          مشاهده و نمره‌دهی
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>مشاهده و نمره‌دهی تمرین</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 pr-2">
            {selectedSubmission && selectedSubmission.exercise && (
              <>
                <SubmissionViewer
                  form={
                    selectedSubmission.exercise.form_structure || {
                      questions: [],
                    }
                  }
                  answers={JSON.parse(selectedSubmission.solution)}
                  submissionInfo={{
                    studentName: `${selectedSubmission.student?.first_name} ${selectedSubmission.student?.last_name}`,
                    submittedAt: selectedSubmission.submitted_at,
                    score: selectedSubmission.score || undefined,
                    feedback: selectedSubmission.feedback || undefined,
                  }}
                />

                <GradingSection
                  score={score}
                  feedback={feedback}
                  grading={gradeSubmissionMutation.isPending}
                  onScoreChange={setScore}
                  onFeedbackChange={setFeedback}
                  onSubmitGrade={handleGradingComplete}
                  maxScore={selectedSubmission.exercise.points ?? 100}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;
