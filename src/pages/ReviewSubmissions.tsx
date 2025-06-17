import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import { GradingSection } from '@/components/exercises/GradingSection';
import { ExerciseForm } from '@/types/formBuilder';
import { SubmissionViewer } from '@/components/exercises/SubmissionViewer';

interface Submission {
  id: string;
  exercise_id: string;
  student_id: string;
  student_email: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  graded_at: string | null;
  graded_by: string | null;
  solution: string;
  student_name: string;
  exercise: {
    title: string;
    form_structure: ExerciseForm | null;
    course_id: string;
  } | null;
}

interface Course {
  id: string;
  name: string;
  // Add other fields as needed
}

const parseFormStructure = (form_structure: any): ExerciseForm | null => {
  if (!form_structure) {
    return null;
  }

  try {
    if (typeof form_structure === 'string') {
      return JSON.parse(form_structure) as ExerciseForm;
    } else if (typeof form_structure === 'object' && form_structure.questions) {
      return form_structure as ExerciseForm;
    }
    return null;
  } catch (error) {
    console.error('Error parsing form_structure:', error);
    return null;
  }
};

const ReviewSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name');
      if (error) {
        toast({
          title: 'خطا',
          description: error.message || 'خطا در دریافت لیست دوره‌ها',
          variant: 'destructive',
        });
        return;
      }
      setCourses(data || []);
    };
    fetchCourses();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('exercise_submissions')
        .select(`
          id,
          exercise_id,
          student_id,
          student_email,
          submitted_at,
          score,
          feedback,
          graded_at,
          graded_by,
          solution,
          student_name,
          exercise:exercises (
            title,
            form_structure,
            course_id
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      // Parse form_structure for each submission
      const parsedSubmissions = (data || []).map(submission => ({
        ...submission,
        exercise: submission.exercise ? {
          ...submission.exercise,
          form_structure: parseFormStructure(submission.exercise.form_structure)
        } : null
      }));

      setSubmissions(parsedSubmissions as Submission[]);
    } catch (err: any) {
      setError('خطا در دریافت اطلاعات');
      toast({
        title: 'خطا',
        description: err.message || 'خطا در دریافت اطلاعات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleGradingComplete = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: score ? parseInt(score) : null,
          feedback: feedback || null,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "نمره‌دهی انجام شد",
        description: "نمره و بازخورد با موفقیت ثبت شد",
      });

      fetchSubmissions();
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
    } finally {
      setGrading(false);
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

          {loading ? (
            <div className="text-center py-4">در حال بارگذاری...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-4">هیچ تمرینی برای بررسی وجود ندارد</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام دانشجو</TableHead>
                  <TableHead className="text-right">ایمیل</TableHead>
                  <TableHead className="text-right">عنوان تمرین</TableHead>
                  <TableHead className="text-right">دوره</TableHead>
                  <TableHead className="text-right">تاریخ ارسال</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.student_name}</TableCell>
                    <TableCell>{submission.student_email}</TableCell>
                    <TableCell>{submission.exercise?.title || '---'}</TableCell>
                    <TableCell>{getCourseName(submission.exercise?.course_id)}</TableCell>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleDateString('fa-IR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.score !== null ? "default" : "secondary"}>
                        {submission.score !== null ? 'بررسی شده' : 'در انتظار بررسی'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewSubmission(submission)}
                        disabled={!submission.exercise}
                      >
                        مشاهده و بررسی
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
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission?.exercise?.title} - {selectedSubmission?.student_name}
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && selectedSubmission.exercise && (
            <>
              <SubmissionViewer
                form={selectedSubmission.exercise.form_structure}
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
                grading={grading}
                onScoreChange={setScore}
                onFeedbackChange={setFeedback}
                onSubmitGrade={handleGradingComplete}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;
