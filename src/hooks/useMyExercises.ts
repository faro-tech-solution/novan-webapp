
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ExerciseWithSubmission } from '@/types/exerciseSubmission';
import { fetchStudentEnrollments, fetchCourseExercises, fetchStudentSubmissions } from '@/services/exerciseDataService';
import { calculateAdjustedDates } from '@/utils/exerciseDateUtils';
import { calculateSubmissionStatus } from '@/utils/exerciseSubmissionUtils';

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

      // Fetch enrollments with term information
      const enrollments = await fetchStudentEnrollments(user.id);
      console.log('Student enrollments with terms:', enrollments);

      if (enrollments.length === 0) {
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
      const exercises = await fetchCourseExercises(enrolledCourseIds);
      console.log('Found exercises for enrolled courses:', exercises);

      if (exercises.length === 0) {
        console.log('No exercises found for enrolled courses');
        setMyExercises([]);
        return;
      }

      // Fetch submissions for the current user
      const submissions = await fetchStudentSubmissions(user.id);
      console.log('User submissions:', submissions);

      // Process exercises with updated date logic
      const exercisesWithSubmissions: ExerciseWithSubmission[] = exercises.map(exercise => {
        const submission = submissions.find(sub => sub.exercise_id === exercise.id);
        const enrollment = enrollments.find(enr => enr.course_id === exercise.course_id);
        
        // Calculate adjusted dates
        const { adjustedOpenDate, adjustedDueDate, adjustedCloseDate } = calculateAdjustedDates(exercise, enrollment);

        // Calculate submission status
        const submissionStatus = calculateSubmissionStatus(submission, adjustedOpenDate, adjustedCloseDate);

        return {
          id: exercise.id,
          title: exercise.title,
          description: exercise.description,
          course_id: exercise.course_id,
          course_name: exercise.courses?.name || 'نامشخص',
          difficulty: exercise.difficulty,
          due_date: adjustedDueDate.toISOString().split('T')[0],
          open_date: adjustedOpenDate.toISOString().split('T')[0],
          close_date: adjustedCloseDate.toISOString().split('T')[0],
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
      setError(err instanceof Error ? err.message : 'خطا در دریافت تمرین‌ها');
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
