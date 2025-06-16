
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ReviewSubmissionsHeader } from '@/components/exercises/ReviewSubmissionsHeader';
import { SubmissionsList } from '@/components/exercises/SubmissionsList';
import { SubmissionDetailView } from '@/components/exercises/SubmissionDetailView';
import { GradingSection } from '@/components/exercises/GradingSection';

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
        <ReviewSubmissionsHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onBack={() => navigate(-1)}
        />

        {selectedSubmission ? (
          <div className="space-y-6">
            <SubmissionDetailView
              submission={selectedSubmission}
              onBack={() => setSelectedSubmission(null)}
            />
            
            <GradingSection
              score={score}
              feedback={feedback}
              grading={grading}
              onScoreChange={setScore}
              onFeedbackChange={setFeedback}
              onSubmitGrade={handleGradeSubmission}
            />
          </div>
        ) : (
          <SubmissionsList
            submissions={filteredSubmissions}
            onViewSubmission={handleViewSubmission}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReviewSubmissions;
