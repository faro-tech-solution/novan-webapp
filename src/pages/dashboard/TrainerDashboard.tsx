import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, Award, Plus, Eye } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import CreateExerciseDialog from "@/components/dialogs/CreateExerciseDialog";
import { useRecentSubmissions } from "@/hooks/useRecentSubmissions";
import { useTrainerStats } from "@/hooks/useTrainerStats";

const TrainerDashboard = () => {
  const navigate = useNavigate();
  const [showCreateExercise, setShowCreateExercise] = useState(false);
  const { submissions, loading: submissionsLoading } = useRecentSubmissions();
  const { stats, loading: statsLoading } = useTrainerStats();

  const handleCreateExercise = () => {
    setShowCreateExercise(true);
  };

  const handleManageCourses = () => {
    navigate("/trainer/courses-management");
  };

  const handleReviewSubmissions = () => {
    navigate("/trainer/review-submissions");
  };

  const handleViewSubmission = (submissionId: string) => {
    navigate(`/trainer/review-submissions?submission=${submissionId}`);
  };

  return (
    <DashboardLayout title="داشبورد مربی">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                مجموع دانشجویان
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
              )}
              <p className="text-xs text-muted-foreground">دانشجویان فعال</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                تمرین‌های فعال
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <div className="text-2xl font-bold">
                  {stats.activeExercises}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                تمرین‌های در دسترس
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                بررسی‌های در انتظار
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="text-2xl font-bold">...</div>
              ) : (
                <div className="text-2xl font-bold">{submissions.length}</div>
              )}
              <p className="text-xs text-muted-foreground">نیاز به توجه شما</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>ارسال‌های اخیر</CardTitle>
            <CardDescription>
              آخرین ارسال‌های تمرین که نیاز به بررسی دارند
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submissionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">در حال بارگذاری...</div>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">هیچ ارسالی یافت نشد</p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.slice(0, 5).map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{submission.student}</p>
                      <p className="text-sm text-gray-600">
                        {submission.exercise}
                      </p>
                      <p className="text-xs text-gray-500">
                        {submission.submitted}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {submission.score ? (
                        <Badge variant="secondary">{submission.score}</Badge>
                      ) : (
                        <Badge variant="outline">در انتظار</Badge>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewSubmission(submission.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>اقدامات سریع</CardTitle>
            <CardDescription>
              وظایف رایج برای مدیریت برنامه آموزشی شما
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={handleCreateExercise}
              >
                <Plus className="h-6 w-6" />
                <span>ایجاد تمرین</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={handleManageCourses}
              >
                <Users className="h-6 w-6" />
                <span>مدیریت درس‌ها</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2"
                onClick={handleReviewSubmissions}
              >
                <Award className="h-6 w-6" />
                <span>بررسی ارسال‌ها</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Exercise Dialog */}
      {showCreateExercise && (
        <CreateExerciseDialog
          open={showCreateExercise}
          onOpenChange={setShowCreateExercise}
        />
      )}
    </DashboardLayout>
  );
};

export default TrainerDashboard;
