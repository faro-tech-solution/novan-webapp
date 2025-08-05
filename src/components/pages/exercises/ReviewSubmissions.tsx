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
import DashboardLayout from "@/components/layout/DashboardLayout";
import RateAndConversation from "@/components/exercises/admin/table/rateAndConversation";
import {
  useSubmissionsQuery,
  useCoursesForReviewQuery,
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




const ReviewSubmissions = () => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "completed" | "all"
  >("all");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedExercise, setSelectedExercise] = useState<string>("all");
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [lastAnswerBy, setLastAnswerBy] = useState<"trainee" | "trainer" | "admin" | "all">("trainee");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Query parameters
  const queryParams = {
    page: currentPage,
    pageSize,
    search: searchTerm,
    status: statusFilter,
    courseId: selectedCourse,
    exerciseId: selectedExercise,
    showDemoUsers,
    lastAnswerBy
  };

  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    error: submissionsError,
  } = useSubmissionsQuery(queryParams);
  
  const { data: courses = [] } = useCoursesForReviewQuery();
  const { exercises = [], loading: exercisesLoading } = useExercisesQuery();

  const submissions = submissionsData?.submissions || [];
  const totalCount = submissionsData?.totalCount || 0;
  const totalPages = submissionsData?.totalPages || 0;

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsDialogOpen(true);
  };

  // Helper to get course name by course_id
  const getCourseName = (course_id: string | undefined) => {
    if (!course_id) return "---";
    const course = courses.find((c) => c.id === course_id);
    return course ? course.name : "---";
  };

  // Reset page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout title="بررسی تمرین‌های ارسالی">
      <Card>
        <CardHeader>
          <CardTitle>لیست تمرین‌های ارسالی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4">
            {/* First row: search textbox | نمایش کاربران آزمایشی */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 md:space-x-reverse gap-2">
              <Input
                placeholder="جستجو بر اساس نام دانشجو، ایمیل، عنوان تمرین یا نام دوره..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleFilterChange();
                }}
                className="max-w-md"
              />
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="show-demo-users"
                  checked={showDemoUsers}
                  onCheckedChange={(v) => {
                    setShowDemoUsers(v === true);
                    handleFilterChange();
                  }}
                />
                <label
                  htmlFor="show-demo-users"
                  className="text-sm cursor-pointer select-none"
                >
                  نمایش کاربران آزمایشی
                </label>
              </div>
            </div>

            {/* Second row: status | courses | exercise | last response by */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 md:space-x-reverse gap-2">
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v as any);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">در انتظار بررسی</SelectItem>
                  <SelectItem value="completed">بررسی شده</SelectItem>
                  <SelectItem value="all">همه</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Course Filter */}
              <Select
                value={selectedCourse}
                onValueChange={(v) => {
                  setSelectedCourse(v);
                  setSelectedExercise("all");
                  handleFilterChange();
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
                onValueChange={(v) => {
                  setSelectedExercise(v);
                  handleFilterChange();
                }}
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
              
              {/* Last Response By Filter */}
              <Select
                value={lastAnswerBy}
                onValueChange={(v) => {
                  setLastAnswerBy(v as any);
                  handleFilterChange();
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="آخرین پاسخ توسط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trainee">دانشجو</SelectItem>
                  <SelectItem value="trainer">مربی</SelectItem>
                  <SelectItem value="admin">مدیر</SelectItem>
                </SelectContent>
              </Select>
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
          ) : submissions.length === 0 ? (
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
                  {submissions.map((submission) => (
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
                        <div className="flex items-center space-x-2 space-x-reverse mt-1">
                          <label className="text-sm text-gray-400">
                            {getCourseName(submission.exercise?.course_id)}
                          </label>
                          {submission.exercise?.exercise_type && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {submission.exercise?.exercise_type === "form"
                                ? "فرم"
                                : submission.exercise?.exercise_type === "video"
                                ? "ویدیو"
                                : submission.exercise?.exercise_type === "audio"
                                ? "صوتی"
                                : "ساده"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.submitted_at ? 
                          new Date(submission.submitted_at).toLocaleDateString("fa-IR") : 
                          "---"
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              submission.score !== null
                                ? "default"
                                : "secondary"
                            }
                          >
                            {submission.score !== null
                              ? "بررسی شده"
                              : "در انتظار بررسی"}
                          </Badge>

                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          onClick={() => handleViewSubmission(submission)}
                          disabled={submission.id.startsWith('no-submission-')}
                        >
                          مشاهده و نمره‌دهی
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    قبلی
                  </Button>
                  <span className="flex items-center px-3">
                    صفحه {currentPage} از {totalPages} (مجموع {totalCount} مورد)
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    بعدی
                  </Button>
                </div>
              )}
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
                <RateAndConversation
                  selectedSubmission={selectedSubmission}
                  onClose={() => setIsDialogOpen(false)}
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
