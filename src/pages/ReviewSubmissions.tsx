import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { GradingSection } from '@/components/exercises/GradingSection';
import { SubmissionViewer } from '@/components/exercises/SubmissionViewer';
import { useSubmissionsQuery, useCoursesQuery, useGradeSubmissionMutation, Submission } from '@/hooks/useReviewSubmissionsQuery';

const ReviewSubmissions = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: submissions = [], isLoading: submissionsLoading, error: submissionsError } = useSubmissionsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const gradeSubmissionMutation = useGradeSubmissionMutation();

  const handleGradingComplete = async () => {
    if (!selectedSubmission) return;

    try {
      await gradeSubmissionMutation.mutateAsync({
        submissionId: selectedSubmission.id,
        score: score ? parseInt(score) : null,
        feedback: feedback || null
      });

      toast({
        title: "نمره‌دهی انجام شد",
        description: "نمره و بازخورد با موفقیت ثبت شد",
      });

      setIsDialogOpen(false);
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
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
    setScore(submission.score?.toString() || '');
    setFeedback(submission.feedback || '');
    setIsDialogOpen(true);
  };

  // Helper to get course name by course_id
  const getCourseName = (course_id: string | undefined) => {
    if (!course_id) return '---';
    const course = courses.find(c => c.id === course_id);
    return course ? course.name : '---';
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (submission.exercise?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(submission.exercise?.course_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="بررسی تمرین‌های ارسالی">
      <Card>
        <CardHeader>
          <CardTitle>لیست تمرین‌های ارسالی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="جستجو بر اساس نام دانشجو، ایمیل، عنوان تمرین یا نام دوره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {submissionsLoading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : submissionsError ? (
            <div className="text-center py-4 text-red-500">
              {submissionsError instanceof Error ? submissionsError.message : 'خطا در دریافت اطلاعات'}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">هیچ تمرینی برای بررسی وجود ندارد</div>
          ) : (
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
                      <label className="block">{submission.student_name}</label>
                      <label className="block text-sm text-gray-400">{submission.student_email}</label>
                    </TableCell>
                    <TableCell>
                      <label className="block">{submission.exercise?.title || '---'}</label>
                      <label className="block text-sm text-gray-400">{getCourseName(submission.exercise?.course_id)}</label>
                    </TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.score !== null ? "default" : "secondary"}>
                        {submission.score !== null ? 'بررسی شده' : 'در انتظار بررسی'}
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
                  form={selectedSubmission.exercise.form_structure || { questions: [] }}
                  answers={JSON.parse(selectedSubmission.solution)}
                  submissionInfo={{
                    studentName: selectedSubmission.student_name,
                    submittedAt: selectedSubmission.submitted_at,
                    score: selectedSubmission.score || undefined,
                    feedback: selectedSubmission.feedback || undefined
                  }}
                />
                
                <GradingSection
                  score={score}
                  feedback={feedback}
                  grading={gradeSubmissionMutation.isPending}
                  onScoreChange={setScore}
                  onFeedbackChange={setFeedback}
                  onSubmitGrade={handleGradingComplete}
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
