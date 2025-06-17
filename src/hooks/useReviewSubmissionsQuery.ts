import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ExerciseForm } from '@/types/formBuilder';

export interface Submission {
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

export interface Course {
  id: string;
  name: string;
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

const fetchSubmissions = async (): Promise<Submission[]> => {
  // First, fetch all submissions
  const { data: submissions, error: submissionsError } = await supabase
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
      exercise:exercises (
        title,
        form_structure,
        course_id
      )
    `)
    .order('submitted_at', { ascending: false });

  if (submissionsError) throw submissionsError;

  // Then, fetch all relevant profiles
  const studentIds = submissions?.map(s => s.student_id) || [];
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .in('id', studentIds);

  if (profilesError) throw profilesError;

  // Create a map of profiles for easy lookup
  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  // Combine the data
  return (submissions || []).map(submission => ({
    ...submission,
    student_name: profileMap.get(submission.student_id) 
      ? `${profileMap.get(submission.student_id)?.first_name} ${profileMap.get(submission.student_id)?.last_name}`.trim()
      : 'نامشخص',
    exercise: submission.exercise ? {
      ...submission.exercise,
      form_structure: parseFormStructure(submission.exercise.form_structure)
    } : null
  })) as Submission[];
};

const fetchCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from('courses')
    .select('id, name');

  if (error) throw error;
  return data || [];
};

export const useSubmissionsQuery = () => {
  return useQuery({
    queryKey: ['submissions'],
    queryFn: fetchSubmissions,
  });
};

export const useCoursesQuery = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });
};

export const useGradeSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, score, feedback }: { submissionId: string; score: number | null; feedback: string | null }) => {
      const { error } = await supabase
        .from('exercise_submissions')
        .update({
          score: score,
          feedback: feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
  });
}; 