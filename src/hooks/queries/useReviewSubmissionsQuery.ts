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

interface SubmissionsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: 'pending' | 'completed' | 'all';
  courseId?: string;
  exerciseId?: string;
  showDemoUsers?: boolean;
  lastAnswerBy?: 'trainee' | 'trainer' | 'admin' | 'all';
}

interface SubmissionsResponse {
  submissions: Submission[];
  totalCount: number;
  totalPages: number;
}

const fetchSubmissions = async (params: SubmissionsQueryParams = {}): Promise<SubmissionsResponse> => {
  const {
    page = 1,
    pageSize = 20,
    search = '',
    status = 'all',
    courseId,
    exerciseId,
    showDemoUsers = false,
    lastAnswerBy = 'trainee'
  } = params;

  let query = supabase
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
      latest_answer,
      submission_status,
      exercise:exercises (
        id,
        title,
        points,
        form_structure,
        course_id,
        exercise_type,
        auto_grade
      ),
      student:profiles!exercise_submissions_student_id_fkey (
        id,
        first_name,
        last_name,
        email,
        is_demo
      )
    `, { count: 'exact' });

  // Apply filters
  if (status === 'pending') {
    query = query.eq('submission_status', 'pending');
  } else if (status === 'completed') {
    query = query.eq('submission_status', 'completed');
  }

  if (courseId && courseId !== 'all') {
    query = query.eq('exercise.course_id', courseId);
  }

  if (exerciseId && exerciseId !== 'all') {
    query = query.eq('exercise_id', exerciseId);
  }

  query = query.eq('student.is_demo', showDemoUsers);

  // Apply search filter
  if (search) {
    query = query.or(
      `student.first_name.ilike.%${search}%,student.last_name.ilike.%${search}%,student.email.ilike.%${search}%,exercise.title.ilike.%${search}%`
    );
  }

  query = query.eq('latest_answer', lastAnswerBy);
  

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  // Order by submitted_at descending
  query = query.order('submitted_at', { ascending: true });

  const { data: submissions, error: submissionsError, count } = await query;

  if (submissionsError) throw submissionsError;

  // Process submissions data
  const processedSubmissions = (submissions || []).map(submission => ({
    ...submission,
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

  return {
    submissions: processedSubmissions,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize)
  };
};

export const useSubmissionsQuery = (params: SubmissionsQueryParams = {}) => {
  const { user, isInitialized } = useAuth();
  
  return useQuery({
    queryKey: ['submissions', params],
    queryFn: () => fetchSubmissions(params),
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
      score
    }: { 
      submissionId: string; 
      score: number | null; 
    }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      
      // Determine the role for latest_answer
      const userRole = user.role || 'admin';
      const latestAnswer = userRole === 'trainer' ? 'trainer' : 'admin';
      
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: score,
          feedback: null, // Always set to null, don't use feedback field
          graded_at: new Date().toISOString(),
          graded_by: user.id,
          latest_answer: latestAnswer
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['myExercises'] });
      queryClient.invalidateQueries({ queryKey: ['submissionConversation'] });
    },
  });
};

export const useMarkAsViewedMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      submissionId 
    }: { 
      submissionId: string; 
    }) => {
      if (!user) throw new Error('کاربر وارد نشده است');
      
      // Determine the role for latest_answer
      const userRole = user.role || 'admin';
      const latestAnswer = userRole === 'trainer' ? 'trainer' : 'admin';
      
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          latest_answer: latestAnswer
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