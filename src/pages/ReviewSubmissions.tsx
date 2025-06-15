
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, MessageSquare, Calendar, User, BookOpen, Star } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubmissionWithDetails {
  id: string;
  exercise_id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  solution: string;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  graded_by: string | null;
  exercise: {
    title: string;
    description: string;
    difficulty: string;
    points: number;
    course_name: string;
  };
}

const ReviewSubmissions = () => {
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('pending');
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('exercise_submissions')
        .select(`
          *,
          exercises (
            title,
            description,
            difficulty,
            points,
            courses (
              name
            )
          )
        `)
        .order('submitted_at', { ascending: false });

      // Filter based on status
      if (filterStatus === 'pending') {
        query = query.is('graded_at', null);
      } else if (filterStatus === 'graded') {
        query = query.not('graded_at', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching submissions:', error);
        toast({
          title: "خطا",
          description: "خطا در بارگذاری تمرین‌ها",
          variant: "destructive",
        });
        return;
      }

      const formattedSubmissions = data?.map(submission => ({
        ...submission,
        exercise: {
          title: submission.exercises?.title || '',
          description: submission.exercises?.description || '',
          difficulty: submission.exercises?.difficulty || '',
          points: submission.exercises?.points || 0,
          course_name: submission.exercises?.courses?.name || 'نامشخص'
        }
      })) || [];

      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری اطلاعات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && (profile.role === 'trainer' || profile.role === 'admin')) {
      fetchSubmissions();
    }
  }, [profile, filterStatus]);

  const handleGradeSubmission = async (submissionId: string, newScore: number, newFeedback: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: isApproved ? newScore : 0,
          feedback: newFeedback,
          graded_at: new Date().toISOString(),
          graded_by: profile?.id
        })
        .eq('id', submissionId);

      if (error) {
        console.error('Error grading submission:', error);
        toast({
          title: "خطا",
          description: "خطا در ثبت نمره",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "موفق",
        description: isApproved ? "تمرین تایید شد" : "تمرین رد شد",
      });

      await fetchSubmissions();
      setSelectedSubmission(null);
      setFeedback('');
      setScore('');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطا",
        description: "خطا در ثبت اطلاعات",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (submission: SubmissionWithDetails) => {
    if (submission.graded_at) {
      const isApproved = submission.score && submission.score > 0;
      return isApproved ? (
        <Badge className="bg-green-100 text-green-800">تایید شده</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">رد شده</Badge>
      );
    }
    return <Badge className="bg-yellow-100 text-yellow-800">در انتظار بررسی</Badge>;
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'آسان':
        return <Badge className="bg-green-100 text-green-800">{difficulty}</Badge>;
      case 'متوسط':
        return <Badge className="bg-yellow-100 text-yellow-800">{difficulty}</Badge>;
      case 'سخت':
        return <Badge className="bg-red-100 text-red-800">{difficulty}</Badge>;
      default:
        return <Badge variant="outline">{difficulty}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="بررسی تمرین‌ها">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="بررسی تمرین‌ها">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-peyda">بررسی تمرین‌های دانشجویان</h2>
            <p className="text-gray-600">مشاهده، بررسی و نمره‌دهی به تمرین‌های ارسالی</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>فیلتر</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                size="sm"
              >
                همه
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('pending')}
                size="sm"
              >
                در انتظار بررسی
              </Button>
              <Button
                variant={filterStatus === 'graded' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('graded')}
                size="sm"
              >
                بررسی شده
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>لیست تمرین‌ها ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                هیچ تمرینی برای بررسی یافت نشد.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">دانشجو</TableHead>
                    <TableHead className="text-right">عنوان تمرین</TableHead>
                    <TableHead className="text-right">درس</TableHead>
                    <TableHead className="text-right">سطح</TableHead>
                    <TableHead className="text-right">تاریخ ارسال</TableHead>
                    <TableHead className="text-right">نمره</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{getStatusBadge(submission)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.student_name}</div>
                          <div className="text-sm text-gray-500">{submission.student_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{submission.exercise.title}</TableCell>
                      <TableCell>{submission.exercise.course_name}</TableCell>
                      <TableCell>{getDifficultyBadge(submission.exercise.difficulty)}</TableCell>
                      <TableCell>{formatDate(submission.submitted_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{submission.score !== null ? submission.score : '-'}</span>
                          <span className="text-gray-500">/ {submission.exercise.points}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setFeedback(submission.feedback || '');
                                setScore(submission.score?.toString() || '');
                              }}
                            >
                              {submission.graded_at ? 'مشاهده' : 'بررسی'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>بررسی تمرین: {submission.exercise.title}</DialogTitle>
                              <DialogDescription>
                                دانشجو: {submission.student_name} | ارسال شده در: {formatDate(submission.submitted_at)}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                              {/* Exercise Info */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">اطلاعات تمرین</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>عنوان</Label>
                                      <p className="text-sm text-gray-600">{submission.exercise.title}</p>
                                    </div>
                                    <div>
                                      <Label>درس</Label>
                                      <p className="text-sm text-gray-600">{submission.exercise.course_name}</p>
                                    </div>
                                    <div>
                                      <Label>سطح</Label>
                                      <div>{getDifficultyBadge(submission.exercise.difficulty)}</div>
                                    </div>
                                    <div>
                                      <Label>حداکثر امتیاز</Label>
                                      <p className="text-sm text-gray-600">{submission.exercise.points}</p>
                                    </div>
                                  </div>
                                  {submission.exercise.description && (
                                    <div className="mt-4">
                                      <Label>توضیحات</Label>
                                      <p className="text-sm text-gray-600 mt-1">{submission.exercise.description}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>

                              {/* Student Solution */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">پاسخ دانشجو</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap text-sm">{submission.solution}</pre>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Grading Section */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">نمره‌دهی و بازخورد</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="score">نمره (از {submission.exercise.points})</Label>
                                      <Input
                                        id="score"
                                        type="number"
                                        min="0"
                                        max={submission.exercise.points}
                                        value={score}
                                        onChange={(e) => setScore(e.target.value)}
                                        placeholder="نمره را وارد کنید"
                                        disabled={!!submission.graded_at}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="feedback">بازخورد</Label>
                                      <Textarea
                                        id="feedback"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="بازخورد خود را وارد کنید..."
                                        rows={4}
                                        disabled={!!submission.graded_at}
                                      />
                                    </div>

                                    {!submission.graded_at && (
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => {
                                            const scoreValue = parseInt(score) || 0;
                                            if (scoreValue > 0) {
                                              handleGradeSubmission(submission.id, scoreValue, feedback, true);
                                            } else {
                                              toast({
                                                title: "خطا",
                                                description: "لطفا نمره معتبری وارد کنید",
                                                variant: "destructive",
                                              });
                                            }
                                          }}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 ml-2" />
                                          تایید
                                        </Button>
                                        <Button
                                          onClick={() => handleGradeSubmission(submission.id, 0, feedback, false)}
                                          variant="destructive"
                                        >
                                          <XCircle className="h-4 w-4 ml-2" />
                                          رد
                                        </Button>
                                      </div>
                                    )}

                                    {submission.graded_at && (
                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                          بررسی شده در: {formatDate(submission.graded_at)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          نمره نهایی: {submission.score} از {submission.exercise.points}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;
