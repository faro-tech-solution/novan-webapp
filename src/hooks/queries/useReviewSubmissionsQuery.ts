import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExerciseForm } from '@/types/formBuilder';
import { Submission } from '@/types/reviewSubmissions';
import { ReviewCourse } from '@/types/course';
import { useAuth } from '@/contexts/AuthContext';

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

const fetchSubmissions = async (): Promise<Submission[]> => {
  // First, fetch all submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('exercise_submissions')
    .select(`
      id,
      exercise_id,
      student_id,
      submitted_at,
      score,
      feedback,
      graded_at,
      graded_by,
      solution,
      auto_graded,
      completion_percentage,
      exercise:exercises (
        id,
        title,
        points,
        form_structure,
        course_id,
        exercise_type,
        auto_grade
      )
    `)
    .order('submitted_at', { ascending: false });

  if (submissionsError) throw submissionsError;

  // Then, fetch all relevant profiles
  const studentIds = submissions?.map(s => s.student_id) || [];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, is_demo')
    .in('id', studentIds);

  if (profilesError) throw profilesError;

  // Create a map of profiles for easy lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Combine the data
  return (submissions || []).map(submission => ({
    ...submission,
    student: profileMap.get(submission.student_id) || undefined,
    exercise: submission.exercise ? {
      id: submission.exercise.id,
      title: submission.exercise.title,
      points: submission.exercise.points,
      form_structure: parseFormStructure(submission.exercise.form_structure),
      course_id: submission.exercise.course_id,
      exercise_type: submission.exercise.exercise_type,
      auto_grade: submission.exercise.auto_grade
    } : null
  })) as Submission[];
};

export const useSubmissionsQuery = () => {
  const { user, isInitialized } = useAuth();
  
  return useQuery({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
    enabled: !!user && isInitialized
  });
};

export const useCoursesForReviewQuery = () => {
  const { user, isInitialized } = useAuth();
  
  return useQuery({
    queryKey: ['reviewCourses'],
    queryFn: async (): Promise<ReviewCourse[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isInitialized
  });
};

export const useGradeSubmissionMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      submissionId, 
      score, 
      feedback 
    }: { 
      submissionId: string; 
      score: number | null; 
      feedback: string | null 
    }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: score,
          feedback: feedback,
          graded_at: new Date().toISOString(),
          graded_by: user.id
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['myExercises'] });
    },
  });
};
