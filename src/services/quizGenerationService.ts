import { supabase } from '@/integrations/supabase/client';
import { QuizQuestion, QuizType, QuizAttempt, GenerateQuizRequest } from '@/types/quiz';

export interface GeneratedQuiz {
  attempt: QuizAttempt;
  questions: QuizQuestion[];
}

/**
 * Generates a quiz dynamically based on student progress and priority logic
 * Priority: 1) Unanswered, 2) Incorrectly answered, 3) Correctly answered
 */
export const generateQuiz = async (
  request: GenerateQuizRequest
): Promise<GeneratedQuiz> => {
  try {
    const { studentId, exerciseId, quizType } = request;

    // Fetch the quiz exercise to get configuration
    const { data: exercise, error: exerciseError } = await supabase
      .from('exercises')
      .select('*, courses!inner(id)')
      .eq('id', exerciseId)
      .eq('exercise_type', 'quiz')
      .single();

    if (exerciseError || !exercise) {
      throw new Error('Quiz exercise not found or invalid exercise type');
    }

    // Parse metadata if it's a string
    let parsedMetadata: any = null;
    if (exercise.metadata) {
      try {
        parsedMetadata = typeof exercise.metadata === 'string' 
          ? JSON.parse(exercise.metadata) 
          : exercise.metadata;
      } catch (error) {
        console.error('Error parsing exercise metadata:', error);
        throw new Error('Invalid quiz configuration format');
      }
    }

    // Parse quiz configuration from metadata
    let quizConfig = parseQuizConfig(parsedMetadata);
    
    // If config is missing, use defaults (for backward compatibility with old exercises)
    if (!quizConfig) {
      console.warn('Quiz configuration not found in metadata, using defaults');
      quizConfig = {
        quiz_type: quizType || 'chapter', // Use the passed quizType if available
        min_questions: 5,
        max_questions: 10,
        passing_score: 60,
      };
    }

    // Determine the reference exercise (last completed exercise)
    const referenceExercise = await getLastCompletedExercise(studentId, exercise.course_id);
    
    if (!referenceExercise) {
      throw new Error('No completed exercises found. Please complete an exercise first.');
    }

    // Determine question scope based on quiz type
    const questionScope = await determineQuestionScope(
      studentId,
      exercise.course_id,
      referenceExercise,
      quizType
    );

    // Fetch questions with priority logic
    const selectedQuestions = await selectQuestionsWithPriority(
      studentId,
      questionScope,
      quizConfig.min_questions,
      quizConfig.max_questions,
      exercise.course_id
    );

    if (selectedQuestions.length === 0) {
      // Provide more helpful error message
      const scopeInfo = quizType === 'chapter' 
        ? `the current chapter (category: ${referenceExercise.category_id || 'none'})`
        : `exercises up to the current one (${referenceExercise.order_index})`;
      
      throw new Error(
        `No questions available for this quiz. ` +
        `Please ensure that quiz questions exist for ${scopeInfo} in the course. ` +
        `You can add questions from the quiz management page.`
      );
    }

    // Create quiz attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        student_id: studentId,
        course_id: exercise.course_id,
        quiz_type: quizType,
        reference_exercise_id: referenceExercise.id,
        question_ids: selectedQuestions.map(q => q.id),
        total_questions: selectedQuestions.length,
        passing_score: quizConfig.passing_score,
        passed: false
      })
      .select('*')
      .single();

    if (attemptError || !attempt) {
      throw new Error(`Error creating quiz attempt: ${attemptError?.message}`);
    }

    // Remove correct answers before returning to student
    const questionsWithoutAnswers = selectedQuestions.map(q => ({
      ...q,
      correct_answer: undefined
    }));

    // Shuffle question order for display
    const shuffledQuestions = shuffleArray(questionsWithoutAnswers);

    return {
      attempt: attempt as QuizAttempt,
      questions: shuffledQuestions as QuizQuestion[]
    };
  } catch (error) {
    console.error('Error in generateQuiz:', error);
    throw error;
  }
};

/**
 * Determines the scope of questions based on quiz type
 */
const determineQuestionScope = async (
  studentId: string,
  courseId: string,
  referenceExercise: any,
  quizType: QuizType
): Promise<Array<{ category_id?: string; exercise_id?: string }>> => {
  if (quizType === 'chapter') {
    // Chapter quiz: only from the category of the reference exercise
    if (referenceExercise.category_id) {
      return [{ category_id: referenceExercise.category_id }];
    } else {
      // If no category, return empty scope (should not happen in well-structured courses)
      throw new Error('Reference exercise has no category assigned');
    }
  } else {
    // Progress quiz: from all exercises up to and including reference exercise
    const { data: allExercises, error } = await supabase
      .from('exercises')
      .select('id, category_id, order_index')
      .eq('course_id', courseId)
      .lte('order_index', referenceExercise.order_index)
      .order('order_index', { ascending: true });

    if (error) {
      throw new Error(`Error fetching exercises for progress quiz: ${error.message}`);
    }

    // Return unique category and exercise IDs
    const categories = new Set<string>();
    const exerciseIds = new Set<string>();
    
    allExercises?.forEach(ex => {
      if (ex.category_id) {
        categories.add(ex.category_id);
      }
      exerciseIds.add(ex.id);
    });

    const scope = [
      ...Array.from(categories).map(cat_id => ({ category_id: cat_id })),
      ...Array.from(exerciseIds).map(ex_id => ({ exercise_id: ex_id }))
    ];

    return scope;
  }
};

/**
 * Selects questions based on priority logic
 */
const selectQuestionsWithPriority = async (
  studentId: string,
  scope: Array<{ category_id?: string; exercise_id?: string }>,
  minQuestions: number,
  maxQuestions: number,
  courseId: string
): Promise<QuizQuestion[]> => {
  // Fetch all questions for the course, then filter by scope in JavaScript
  // This is more reliable than complex PostgREST OR queries
  const { data: allCourseQuestions, error: fetchError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('course_id', courseId);

  if (fetchError) {
    console.error('Error fetching quiz questions:', fetchError);
    return [];
  }

  if (!allCourseQuestions || allCourseQuestions.length === 0) {
    console.warn(`No questions found for course ${courseId}`);
    return [];
  }

  // Filter questions by scope
  let allQuestions: QuizQuestion[] = [];
  
  if (scope.length === 0) {
    // No scope - return all course questions
    allQuestions = allCourseQuestions as QuizQuestion[];
  } else {
    // Collect category IDs and exercise IDs from scope
    const categoryIds = new Set<string>();
    const exerciseIds = new Set<string>();
    
    scope.forEach(s => {
      if (s.category_id) {
        categoryIds.add(s.category_id);
      }
      if (s.exercise_id) {
        exerciseIds.add(s.exercise_id);
      }
    });

    // Filter questions that match scope OR are general course questions
    allQuestions = allCourseQuestions.filter((q: any) => {
      // General course questions (no category, no exercise) are always included
      if (!q.category_id && !q.exercise_id) {
        return true;
      }
      
      // Check if question matches any category in scope
      if (q.category_id && categoryIds.has(q.category_id)) {
        return true;
      }
      
      // Check if question matches any exercise in scope
      if (q.exercise_id && exerciseIds.has(q.exercise_id)) {
        return true;
      }
      
      return false;
    }) as QuizQuestion[];
  }

  if (!allQuestions || allQuestions.length === 0) {
    console.warn(`No questions found for course ${courseId} with scope:`, scope);
    console.log(`Total course questions: ${allCourseQuestions.length}, Filtered questions: 0`);
    return [];
  }

  console.log(`Found ${allQuestions.length} questions for scope:`, scope);
  console.log(`Total course questions: ${allCourseQuestions.length}, After scope filter: ${allQuestions.length}`);

  // Fetch student's answer history
  const { data: studentAttempts } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('student_id', studentId);

  const attemptIds = studentAttempts?.map(a => a.id) || [];

  let answerHistory: any[] = [];
  
  if (attemptIds.length > 0) {
    const { data } = await supabase
      .from('quiz_answers')
      .select('question_id, is_correct, answered_at')
      .in('attempt_id', attemptIds)
      .order('answered_at', { ascending: false });

    answerHistory = data || [];
  }

  // Categorize questions by priority
  const unanswered: QuizQuestion[] = [];
  const incorrectlyAnswered: QuizQuestion[] = [];
  const correctlyAnswered: QuizQuestion[] = [];

  allQuestions.forEach(question => {
    const answers = answerHistory.filter(a => a.question_id === question.id);
    
    if (answers.length === 0) {
      unanswered.push(question);
    } else {
      const lastAnswer = answers[0];
      if (!lastAnswer.is_correct) {
        incorrectlyAnswered.push(question);
      } else {
        correctlyAnswered.push(question);
      }
    }
  });

  // Select questions based on priority
  const selected: QuizQuestion[] = [];
  const targetCount = Math.min(maxQuestions, allQuestions.length);
  
  // First: unanswered questions
  const unansweredCount = Math.min(unanswered.length, targetCount);
  selected.push(...shuffleArray(unanswered).slice(0, unansweredCount));

  // If we need more: incorrectly answered
  if (selected.length < targetCount) {
    const needed = targetCount - selected.length;
    const incorrectCount = Math.min(incorrectlyAnswered.length, needed);
    selected.push(...shuffleArray(incorrectlyAnswered).slice(0, incorrectCount));
  }

  // If we still need more: correctly answered
  if (selected.length < targetCount) {
    const needed = targetCount - selected.length;
    const correctCount = Math.min(correctlyAnswered.length, needed);
    selected.push(...shuffleArray(correctlyAnswered).slice(0, correctCount));
  }

  // Ensure we have at least minQuestions if available
  if (selected.length < minQuestions && allQuestions.length >= minQuestions) {
    const remaining = allQuestions.filter(q => !selected.find(s => s.id === q.id));
    const additionalNeeded = minQuestions - selected.length;
    selected.push(...shuffleArray(remaining).slice(0, additionalNeeded));
  }

  return selected;
};

/**
 * Gets the last completed exercise for a student in a course
 */
const getLastCompletedExercise = async (
  studentId: string,
  courseId: string
): Promise<any> => {
  const { data, error } = await supabase
    .from('exercise_submissions')
    .select(`
      exercise_id,
      exercises!inner(id, order_index, category_id)
    `)
    .eq('student_id', studentId)
    .eq('course_id', courseId)
    .eq('submission_status', 'completed')
    .order('submitted_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Error fetching last completed exercise: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return null;
  }

  return (data[0] as any).exercises;
};

/**
 * Parses quiz configuration from exercise metadata
 * Returns default values if config is missing or incomplete
 */
const parseQuizConfig = (metadata: any): { quiz_type: QuizType; min_questions: number; max_questions: number; passing_score: number } | null => {
  // If metadata is missing, return null (will be handled by caller)
  if (!metadata || typeof metadata !== 'object') {
    return null;
  }

  const config = metadata.quiz_config;
  
  // If quiz_config doesn't exist, return null (will be handled by caller)
  if (!config || typeof config !== 'object') {
    return null;
  }

  // Always return a valid config with defaults for missing values
  return {
    quiz_type: (config.quiz_type === 'chapter' || config.quiz_type === 'progress') ? config.quiz_type : 'chapter',
    min_questions: typeof config.min_questions === 'number' && config.min_questions >= 5 && config.min_questions <= 10 
      ? config.min_questions 
      : 5,
    max_questions: typeof config.max_questions === 'number' && config.max_questions >= 5 && config.max_questions <= 10 
      ? config.max_questions 
      : 10,
    passing_score: typeof config.passing_score === 'number' && config.passing_score >= 0 && config.passing_score <= 100
      ? config.passing_score
      : 60
  };
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
