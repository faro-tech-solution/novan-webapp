import { supabase } from '@/integrations/supabase/client';
import { QuizAttempt, QuizQuestionWithStats } from '@/types/quiz';

export interface QuizStatistics {
  totalAttempts: number;
  totalPassed: number;
  averageScore: number;
  bestScore: number;
  lastAttemptDate: string | null;
}

/**
 * Fetches quiz history for a student in a course
 */
export const fetchQuizHistory = async (
  studentId: string,
  courseId: string,
  quizType?: 'chapter' | 'progress'
): Promise<QuizAttempt[]> => {
  try {
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('completed_at', { ascending: false });

    if (quizType) {
      query = query.eq('quiz_type', quizType);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching quiz history: ${error.message}`);
    }

    return (data || []) as QuizAttempt[];
  } catch (error) {
    console.error('Error in fetchQuizHistory:', error);
    throw error;
  }
};

/**
 * Fetches quiz statistics for a student in a course
 */
export const fetchQuizStatistics = async (
  studentId: string,
  courseId: string
): Promise<QuizStatistics> => {
  try {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('completed_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching quiz statistics: ${error.message}`);
    }

    if (!attempts || attempts.length === 0) {
      return {
        totalAttempts: 0,
        totalPassed: 0,
        averageScore: 0,
        bestScore: 0,
        lastAttemptDate: null
      };
    }

    const completedAttempts = attempts.filter(a => a.completed_at);
    const totalAttempts = completedAttempts.length;
    const totalPassed = completedAttempts.filter(a => a.passed).length;

    const scores = completedAttempts.map(a => {
      const percentage = Math.round((a.score / a.total_questions) * 100);
      return percentage;
    });

    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores, 0);
    const lastAttemptDate = completedAttempts[0]?.completed_at || null;

    return {
      totalAttempts,
      totalPassed,
      averageScore: Math.round(averageScore),
      bestScore,
      lastAttemptDate
    };
  } catch (error) {
    console.error('Error in fetchQuizStatistics:', error);
    throw error;
  }
};

/**
 * Fetches question statistics for a student across all questions in a course
 */
export const fetchQuestionStatistics = async (
  courseId: string,
  studentId?: string
): Promise<QuizQuestionWithStats[]> => {
  try {
    // Fetch all questions for the course
    const { data: questions, error: questionsError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('course_id', courseId);

    if (questionsError) {
      throw new Error(`Error fetching questions: ${questionsError.message}`);
    }

    if (!studentId) {
      return (questions || []) as QuizQuestionWithStats[];
    }

    // Fetch student's quiz attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('student_id', studentId)
      .eq('course_id', courseId);

    if (attemptsError) {
      throw new Error(`Error fetching attempts: ${attemptsError.message}`);
    }

    const attemptIds = attempts?.map(a => a.id) || [];

    if (attemptIds.length === 0) {
      return (questions || []) as QuizQuestionWithStats[];
    }

    // Fetch all answers for this student
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('question_id, is_correct, answered_at')
      .in('attempt_id', attemptIds);

    if (answersError) {
      throw new Error(`Error fetching answers: ${answersError.message}`);
    }

    // Calculate statistics for each question
    const questionsWithStats = questions?.map(question => {
      const questionAnswers = answers?.filter(a => a.question_id === question.id) || [];
      const timesAnswered = questionAnswers.length;
      const correctAnswers = questionAnswers.filter(a => a.is_correct).length;
      const lastAnswered = questionAnswers.length > 0
        ? questionAnswers.sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime())[0].answered_at
        : undefined;

      return {
        ...question,
        times_answered: timesAnswered,
        correct_answers: correctAnswers,
        last_answered: lastAnswered
      };
    });

    return questionsWithStats || [];
  } catch (error) {
    console.error('Error in fetchQuestionStatistics:', error);
    throw error;
  }
};

/**
 * Fetches overall quiz progress metrics for a student
 */
export const fetchQuizProgressMetrics = async (
  studentId: string,
  courseId: string
): Promise<{
  totalQuizzes: number;
  completedQuizzes: number;
  passedQuizzes: number;
  averageScore: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
}> => {
  try {
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('started_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching quiz progress: ${error.message}`);
    }

    const completedAttempts = attempts?.filter(a => a.completed_at) || [];
    const totalQuizzes = attempts?.length || 0;
    const completedQuizzes = completedAttempts.length;
    const passedQuizzes = completedAttempts.filter(a => a.passed).length;

    const scores = completedAttempts.map(a => {
      const percentage = Math.round((a.score / a.total_questions) * 100);
      return percentage;
    });

    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    // Calculate improvement trend (compare first half vs second half)
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    
    if (scores.length >= 4) {
      const halfPoint = Math.floor(scores.length / 2);
      const firstHalf = scores.slice(0, halfPoint);
      const secondHalf = scores.slice(halfPoint);

      const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

      const difference = secondHalfAvg - firstHalfAvg;
      
      if (difference > 5) {
        improvementTrend = 'improving';
      } else if (difference < -5) {
        improvementTrend = 'declining';
      }
    }

    return {
      totalQuizzes,
      completedQuizzes,
      passedQuizzes,
      averageScore,
      improvementTrend
    };
  } catch (error) {
    console.error('Error in fetchQuizProgressMetrics:', error);
    throw error;
  }
};

/**
 * Fetches the latest quiz attempt for a student in a course
 */
export const fetchLatestQuizAttempt = async (
  studentId: string,
  courseId: string
): Promise<QuizAttempt | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', courseId)
      .order('started_at', { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Error fetching latest quiz attempt: ${error.message}`);
    }

    return data && data.length > 0 ? (data[0] as QuizAttempt) : null;
  } catch (error) {
    console.error('Error in fetchLatestQuizAttempt:', error);
    throw error;
  }
};
