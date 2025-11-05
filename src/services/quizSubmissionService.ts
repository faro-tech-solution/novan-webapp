import { supabase } from '@/integrations/supabase/client';
import { QuizAttempt, QuizAnswer, QuizResults, SubmitQuizRequest } from '@/types/quiz';
import { fetchQuizQuestionById } from './quizQuestionService';

/**
 * Submits quiz answers and calculates the score
 */
export const submitQuizAnswers = async (
  request: SubmitQuizRequest
): Promise<QuizResults> => {
  try {
    const { attemptId, answers } = request;

    // Fetch the quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Quiz attempt not found');
    }

    // Check if already completed - this prevents updating a previous attempt
    if (attempt.completed_at) {
      console.error('Attempt to submit already completed quiz attempt:', attemptId);
      console.error('Attempt completed_at:', attempt.completed_at);
      throw new Error('Quiz has already been submitted. Cannot update a completed attempt. Please retake the quiz to create a new attempt.');
    }
    
    console.log('Submitting quiz attempt:', attemptId);
    console.log('Attempt status - completed_at:', attempt.completed_at, 'score:', attempt.score);

    // Fetch all questions for this attempt
    const questionIds = attempt.question_ids;
    const questions = await Promise.all(
      questionIds.map(async (qId: string) => {
        const question = await fetchQuizQuestionById(qId);
        if (!question) {
          throw new Error(`Question not found: ${qId}`);
        }
        return question;
      })
    );

    // Validate answers
    if (answers.length !== questions.length) {
      throw new Error(`Number of answers (${answers.length}) does not match number of questions (${questions.length})`);
    }

    // Check for duplicate question IDs in answers
    const answerQuestionIds = new Set(answers.map(a => a.question_id));
    if (answerQuestionIds.size !== answers.length) {
      throw new Error('Duplicate question IDs in answers');
    }

    // Grade the answers
    const gradedAnswers: QuizAnswer[] = [];
    let correctCount = 0;

    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.question_id);
      
      if (!question) {
        throw new Error(`Question not found: ${answer.question_id}`);
      }

      const isCorrect = question.correct_answer === answer.selected_answer;
      
      if (isCorrect) {
        correctCount++;
      }

      // Create answer record
      const { data: answerRecord, error: answerError } = await supabase
        .from('quiz_answers')
        .insert({
          attempt_id: attemptId,
          question_id: answer.question_id,
          selected_answer: answer.selected_answer,
          is_correct: isCorrect
        })
        .select('*')
        .single();

      if (answerError || !answerRecord) {
        throw new Error(`Error saving answer: ${answerError?.message}`);
      }

      gradedAnswers.push(answerRecord as QuizAnswer);
    }

    // Calculate score percentage
    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= attempt.passing_score;

    // Update quiz attempt with results
    // IMPORTANT: This only updates the specific attempt being submitted (scoped by .eq('id', attemptId))
    // This will NOT affect previous attempts - each retake creates a new attempt with a new ID
    console.log('Updating quiz attempt with results. Attempt ID:', attemptId);
    console.log('Score:', correctCount, 'Passed:', passed);
    
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('quiz_attempts')
      .update({
        score: correctCount,
        passed: passed,
        completed_at: new Date().toISOString()
      })
      .eq('id', attemptId) // Only updates this specific attempt
      .is('completed_at', null) // Extra safety: only update if not already completed
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating quiz attempt:', updateError);
      throw new Error(`Error updating quiz attempt: ${updateError.message}`);
    }
    
    if (!updatedAttempt) {
      // This could happen if the attempt was already completed (due to the .is('completed_at', null) check)
      console.error('No attempt updated - possibly already completed. Attempt ID:', attemptId);
      throw new Error('Quiz attempt not found or already completed. Cannot update a completed attempt.');
    }
    
    console.log('Quiz attempt updated successfully. Updated attempt ID:', updatedAttempt.id);

    return {
      attempt: updatedAttempt as QuizAttempt,
      answers: gradedAnswers,
      questions: questions,
      percentage: scorePercentage
    };
  } catch (error) {
    console.error('Error in submitQuizAnswers:', error);
    throw error;
  }
};

/**
 * Fetches results for a completed quiz attempt
 */
export const fetchQuizResults = async (attemptId: string): Promise<QuizResults> => {
  try {
    // Fetch the quiz attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (attemptError || !attempt) {
      throw new Error('Quiz attempt not found');
    }

    // Fetch all answers for this attempt
    const { data: answers, error: answersError } = await supabase
      .from('quiz_answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('answered_at', { ascending: true });

    if (answersError) {
      throw new Error(`Error fetching answers: ${answersError.message}`);
    }

    // Fetch all questions
    const questions = await Promise.all(
      attempt.question_ids.map(async (qId: string) => {
        const question = await fetchQuizQuestionById(qId);
        if (!question) {
          throw new Error(`Question not found: ${qId}`);
        }
        return question;
      })
    );

    const percentage = Math.round((attempt.score / attempt.total_questions) * 100);

    return {
      attempt: attempt as QuizAttempt,
      answers: (answers || []) as QuizAnswer[],
      questions: questions,
      percentage: percentage
    };
  } catch (error) {
    console.error('Error in fetchQuizResults:', error);
    throw error;
  }
};

/**
 * Fetches the latest completed quiz attempt for a specific exercise and student
 */
export const fetchLatestCompletedQuizAttempt = async (
  studentId: string,
  exerciseId: string,
  quizType: 'chapter' | 'progress'
): Promise<QuizAttempt | null> => {
  try {
    // First, get the exercise to find the course_id
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('course_id')
      .eq('id', exerciseId)
      .single();

    if (exerciseError || !exercise) {
      return null;
    }

    // Find completed attempts for this course and quiz type
    // Since we don't store the quiz exercise_id directly, we match by:
    // - Same course
    // - Same quiz_type
    // - Completed (has completed_at)
    const { data: attempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('student_id', studentId)
      .eq('course_id', exercise.course_id)
      .eq('quiz_type', quizType)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest completed quiz attempt:', error);
      return null;
    }

    // Filter to find attempts that reference exercises from the same quiz context
    // For now, return the most recent one since quiz attempts are course-level
    return attempts && attempts.length > 0 ? (attempts[0] as QuizAttempt) : null;
  } catch (error) {
    console.error('Error in fetchLatestCompletedQuizAttempt:', error);
    return null;
  }
};

/**
 * Retakes a quiz with the same questions in random order
 * IMPORTANT: This creates a NEW attempt record in the database to preserve full history.
 * The original attempt is NOT modified or deleted.
 */
export const retakeQuiz = async (
  originalAttemptId: string,
  studentId: string
): Promise<{ attempt: QuizAttempt; questions: any[] }> => {
  try {
    // Fetch the original attempt to get its configuration
    const { data: originalAttempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', originalAttemptId)
      .single();

    if (attemptError || !originalAttempt) {
      throw new Error('Original quiz attempt not found');
    }

    // Create a NEW attempt record (not updating the original)
    // This preserves the full history of all quiz attempts
    // The original attempt remains unchanged in the database
    // IMPORTANT: Do NOT include the original attempt's ID - let the database generate a new UUID
    const insertData: any = {
      student_id: studentId,
      course_id: originalAttempt.course_id,
      quiz_type: originalAttempt.quiz_type,
      reference_exercise_id: originalAttempt.reference_exercise_id,
      question_ids: originalAttempt.question_ids, // Same questions as original
      total_questions: originalAttempt.total_questions,
      passing_score: originalAttempt.passing_score,
      passed: false, // New attempt starts as not passed
      score: 0, // Reset score for new attempt
      completed_at: null, // New attempt is not completed yet
      // Note: started_at will be auto-generated by database default
    };
    
    console.log('Creating new retake attempt. Original attempt ID:', originalAttempt.id);
    console.log('New attempt data (without ID):', { ...insertData, id: '[will be generated]' });
    
    const { data: newAttempt, error: newAttemptError } = await supabase
      .from('quiz_attempts')
      .insert(insertData)
      .select('*')
      .single();

    if (newAttemptError || !newAttempt) {
      throw new Error(`Error creating retake attempt: ${newAttemptError?.message}`);
    }

    // Verify the new attempt has a different ID than the original
    if (newAttempt.id === originalAttempt.id) {
      throw new Error('ERROR: New attempt has the same ID as original! This should never happen.');
    }
    
    console.log('New retake attempt created successfully. New attempt ID:', newAttempt.id);
    console.log('Original attempt ID (unchanged):', originalAttempt.id);

    // Fetch questions without answers
    const questions = await Promise.all(
      originalAttempt.question_ids.map(async (qId: string) => {
        const question = await fetchQuizQuestionById(qId);
        if (!question) {
          throw new Error(`Question not found: ${qId}`);
        }
        return {
          ...question,
          correct_answer: undefined
        };
      })
    );

    // Shuffle questions for retake
    const shuffledQuestions = shuffleArray(questions);

    return {
      attempt: newAttempt as QuizAttempt,
      questions: shuffledQuestions
    };
  } catch (error) {
    console.error('Error in retakeQuiz:', error);
    throw error;
  }
};

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
