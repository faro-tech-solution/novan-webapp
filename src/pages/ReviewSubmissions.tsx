import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Clock, Award, User, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SubmissionViewer } from '@/components/exercises/SubmissionViewer';
import { ExerciseForm, FormAnswer } from '@/types/formBuilder';

interface Submission {
  id: string;
  student_name: string;
  student_email: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  solution: string;
  exercise: {
    id: string;
    title: string;
    points: number;
    form_structure: any;
  };
}

const parseFormStructure = (form_structure: any): ExerciseForm => {
  if (!form_structure) {
    return { questions: [] };
  }

  try {
    if (typeof form_structure === 'string') {
      return JSON.parse(form_structure) as ExerciseForm;
    } else if (typeof form_structure === 'object' && form_structure.questions) {
      return form_structure as ExerciseForm;
    }
    return { questions: [] };
  } catch (error) {
    console.error('Error parsing form_structure:', error);
    return { questions: [] };
  }
};

const ReviewSubmissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercise_submissions')
        .select(`
          *,
          exercise:exercises (
            id,
            title,
            points,
            form_structure
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری پاسخ‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;

    try {
      setGrading(true);
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: score ? parseInt(score) : null,
          feedback: feedback || null,
          graded_by: user?.id,
          graded_at: new Date().toISOString()
        })
        .eq('id', selectedSubmission.id);

      if (error) throw error;

      toast({
        title: "نمره‌دهی انجام شد",
        description: "نمره و بازخورد با موفقیت ثبت شد",
      });

      // Refresh submissions
      fetchSubmissions();
      setSelectedSubmission(null);
      setScore('');
      setFeedback('');
    } catch (error) {
      console.error('Error grading submission:', error);
      toast({
        title: "خطا",
        description: "خطا در ثبت نمره",
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
  };

  const filteredSubmissions = submissions.filter(submission =>
    submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.exercise.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="بررسی پاسخ‌ها">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">در حال بارگذاری...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="بررسی پاسخ‌ها">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            بازگشت
          </Button>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="جستجو در پاسخ‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {selectedSubmission ? (
          // Detailed view
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{selectedSubmission.exercise.title}</CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-4 space-x-reverse text-sm">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <User className="h-4 w-4" />
                          <span>{selectedSubmission.student_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(selectedSubmission.submitted_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Award className="h-4 w-4" />
                          <span>{selectedSubmission.exercise.points} امتیاز</span>
                        </div>
                      </div>
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                    بازگشت به لیست
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Submission Content */}
            <Card>
              <CardHeader>
                <CardTitle>پاسخ دانشجو</CardTitle>
              </CardHeader>
              <CardContent>
                <SubmissionViewer
                  form={parseFormStructure(selectedSubmission.exercise.form_structure)}
                  answers={JSON.parse(selectedSubmission.solution) as FormAnswer[]}
                  submissionInfo={{
                    studentName: selectedSubmission.student_name,
                    submittedAt: selectedSubmission.submitted_at,
                    score: selectedSubmission.score || undefined,
                    feedback: selectedSubmission.feedback || undefined
                  }}
                />
              </CardContent>
            </Card>

            {/* Grading Section */}
            <Card>
              <CardHeader>
                <CardTitle>نمره‌دهی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    نمره (از 0 تا 100)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="نمره را وارد کنید"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    بازخورد
                  </label>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="بازخورد خود را وارد کنید..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleGradeSubmission} disabled={grading}>
                  {grading ? 'در حال ثبت...' : 'ثبت نمره و بازخورد'}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          // List view
          <div className="space-y-4">
            {filteredSubmissions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">هیچ پاسخی یافت نشد</p>
                </CardContent>
              </Card>
            ) : (
              filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{submission.exercise.title}</h3>
                        <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <User className="h-4 w-4" />
                            <span>{submission.student_name}</span>
                          </div>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Clock className="h-4 w-4" />
                            <span>{formatDate(submission.submitted_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {submission.score !== null ? (
                          <Badge variant={submission.score >= 80 ? "default" : submission.score >= 60 ? "secondary" : "destructive"}>
                            نمره: {submission.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">بدون نمره</Badge>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          مشاهده
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;
