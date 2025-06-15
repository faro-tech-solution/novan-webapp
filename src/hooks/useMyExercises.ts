
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExerciseWithSubmission {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  course_name?: string;
  difficulty: string;
  due_date: string;
  open_date: string;
  close_date: string;
  points: number;
  estimated_time: string;
  submission_status: 'not_started' | 'pending' | 'completed' | 'overdue';
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
}

export const useMyExercises = () => {
  const [myExercises, setMyExercises] = useState<ExerciseWithSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchMyExercises = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching exercises for student:', user.id);

      // First, fetch enrollments with term information
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          course_id,
          enrolled_at,
          term_id,
          courses (
            id,
            name
          ),
          course_terms (
            id,
            start_date,
            end_date
          )
        `)
        .eq('student_id', user.id)
        .eq('status', 'active');

      if (enrollmentsError) {
        console.error('Error fetching enrollments:', enrollmentsError);
        setError('خطا در دریافت دوره‌های ثبت‌نام شده: ' + enrollmentsError.message);
        return;
      }

      console.log('Student enrollments with terms:', enrollments);

      if (!enrollments || enrollments.length === 0) {
        console.log('No course enrollments found for student');
        setMyExercises([]);
        return;
      }

      // Extract course IDs from enrollments
      const enrolledCourseIds = enrollments
        .filter(enrollment => enrollment.courses)
        .map(enrollment => enrollment.course_id);

      console.log('Enrolled course IDs:', enrolledCourseIds);

      if (enrolledCourseIds.length === 0) {
        console.log('No valid course IDs found');
        setMyExercises([]);
        return;
      }

      // Fetch exercises for those courses
      const { data: exercises, error: exercisesError } = await supabase
        .from('exercises')
        .select(`
          id,
          title,
          description,
          course_id,
          difficulty,
          due_date,
          open_date,
          close_date,
          points,
          estimated_time,
          created_at,
          updated_at,
          created_by,
          courses (
            id,
            name
          )
        `)
        .in('course_id', enrolledCourseIds)
        .order('due_date', { ascending: true });

      console.log('Query result for course exercises:', { exercises, exercisesError });

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        setError('خطا در دریافت تمرین‌ها: ' + exercisesError.message);
        return;
      }

      if (!exercises || exercises.length === 0) {
        console.log('No exercises found for enrolled courses');
        setMyExercises([]);
        return;
      }

      console.log('Found exercises for enrolled courses:', exercises);

      // Fetch submissions for the current user
      const { data: submissions, error: submissionsError } = await supabase
        .from('exercise_submissions')
        .select('*')
        .eq('student_id', user.id);

      if (submissionsError) {
        console.error('Error fetching submissions:', submissionsError);
      } else {
        console.log('User submissions:', submissions);
      }

      // Process exercises with updated date logic
      const exercisesWithSubmissions: ExerciseWithSubmission[] = exercises.map(exercise => {
        const submission = submissions?.find(sub => sub.exercise_id === exercise.id);
        
        // Find the enrollment for this specific course
        const enrollment = enrollments.find(enr => enr.course_id === exercise.course_id);
        
        // Calculate the reference start date based on term or enrollment date
        let referenceStartDate: Date;
        
        if (enrollment?.course_terms?.start_date) {
          // If student is assigned to a term with start date, use term start date
          referenceStartDate = new Date(enrollment.course_terms.start_date);
          console.log(`Using term start date for course ${exercise.course_id}:`, referenceStartDate);
        } else {
          // If no term start date, use enrollment date
          referenceStartDate = new Date(enrollment?.enrolled_at || new Date());
          console.log(`Using enrollment date for course ${exercise.course_id}:`, referenceStartDate);
        }

        // Calculate adjusted dates based on the reference start date
        const originalOpenDate = new Date(exercise.open_date);
        const originalCloseDate = new Date(exercise.close_date);
        const originalDueDate = new Date(exercise.due_date);
        
        // Calculate the difference from exercise creation to open/close/due dates
        const exerciseCreatedDate = new Date(exercise.created_at);
        const daysToOpen = Math.ceil((originalOpenDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysToDue = Math.ceil((originalDueDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));
        const daysToClose = Math.ceil((originalCloseDate.getTime() - exerciseCreatedDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate new dates based on reference start date
        const adjustedOpenDate = new Date(referenceStartDate);
        adjustedOpenDate.setDate(adjustedOpenDate.getDate() + Math.max(0, daysToOpen));
        
        const adjustedDueDate = new Date(referenceStartDate);
        adjustedDueDate.setDate(adjustedDueDate.getDate() + Math.max(0, daysToDue));
        
        const adjustedCloseDate = new Date(referenceStartDate);
        adjustedCloseDate.setDate(adjustedCloseDate.getDate() + Math.max(0, daysToClose));

        // Calculate submission status based on adjusted dates
        let submissionStatus: 'not_started' | 'pending' | 'completed' | 'overdue' = 'not_started';
        const today = new Date();

        if (submission) {
          if (submission.score !== null) {
            submissionStatus = 'completed';
          } else {
            submissionStatus = 'pending';
          }
        } else {
          if (today > adjustedCloseDate) {
            submissionStatus = 'overdue';
          } else if (today >= adjustedOpenDate && today <= adjustedCloseDate) {
            submissionStatus = 'not_started';
          }
        }

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_id: exercise.course_id,
          course_name: exercise.courses?.name || 'نامشخص',
          difficulty: exercise.difficulty,
          due_date: adjustedDueDate.toISOString().split('T')[0], // Use adjusted due date
          open_date: adjustedOpenDate.toISOString().split('T')[0], // Use adjusted open date
          close_date: adjustedCloseDate.toISOString().split('T')[0], // Use adjusted close date
          points: exercise.points,
          estimated_time: exercise.estimated_time,
          submission_status: submissionStatus,
          submitted_at: submission?.submitted_at || null,
          score: submission?.score || null,
          feedback: submission?.feedback || null,
        };
      });

      console.log('Final exercises with adjusted dates and submissions:', exercisesWithSubmissions);
      setMyExercises(exercisesWithSubmissions);
    } catch (err) {
      console.error('Error in fetchMyExercises:', err);
      setError('خطا در دریافت تمرین‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyExercises();
    }
  }, [user]);

  return {
    myExercises,
    loading,
    error,
    refetch: fetchMyExercises
  };
};
