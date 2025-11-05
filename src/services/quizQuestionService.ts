import { supabase } from '@/integrations/supabase/client';
import { QuizQuestion, QuizQuestionWithStats } from '@/types/quiz';

export interface CreateQuizQuestionData {
  course_id: string;
  category_id?: string | null;
  exercise_id?: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'a' | 'b' | 'c' | 'd';
}

export interface UpdateQuizQuestionData {
  course_id?: string;
  category_id?: string | null;
  exercise_id?: string | null;
  question_text?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: 'a' | 'b' | 'c' | 'd';
}

// Fetch all quiz questions for a course
export const fetchQuizQuestions = async (courseId: string): Promise<QuizQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select(`
        *,
        exercise_categories!left (
          name
        ),
        exercises!left (
          title
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.message.includes('relation "quiz_questions" does not exist')) {
        console.warn('Quiz questions table does not exist. Please run the migration first.');
        return [];
      }
      throw new Error(`Error fetching quiz questions: ${error.message}`);
    }

    // Transform the data to include category and exercise names
    return (data || []).map((item: any) => ({
      ...item,
      category_name: item.exercise_categories?.name,
      exercise_name: item.exercises?.title,
    })) as QuizQuestion[];
  } catch (error) {
    console.error('Error in fetchQuizQuestions:', error);
    return [];
  }
};

// Fetch quiz questions by category
export const fetchQuizQuestionsByCategory = async (categoryId: string): Promise<QuizQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching quiz questions by category: ${error.message}`);
    }

    return (data || []) as QuizQuestion[];
  } catch (error) {
    console.error('Error in fetchQuizQuestionsByCategory:', error);
    throw error;
  }
};

// Fetch quiz questions by exercise
export const fetchQuizQuestionsByExercise = async (exerciseId: string): Promise<QuizQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching quiz questions by exercise: ${error.message}`);
    }

    return (data || []) as QuizQuestion[];
  } catch (error) {
    console.error('Error in fetchQuizQuestionsByExercise:', error);
    throw error;
  }
};

// Fetch quiz questions with statistics
export const fetchQuizQuestionsWithStats = async (courseId: string, studentId?: string): Promise<QuizQuestionWithStats[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching quiz questions: ${error.message}`);
    }

    // If studentId is provided, fetch statistics
    if (studentId && data) {
      const questionsWithStats = await Promise.all(
        (data || []).map(async (question) => {
          // Get answer statistics for this question
          const { data: answers, error: answersError } = await supabase
            .from('quiz_answers')
            .select('*')
            .eq('question_id', question.id)
            .eq('attempt_id', 
              supabase
                .from('quiz_attempts')
                .select('id')
                .eq('student_id', studentId)
            );

          if (!answersError && answers) {
            const timesAnswered = answers.length;
            const correctAnswers = answers.filter(a => a.is_correct).length;
            const lastAnswered = answers.length > 0 
              ? answers.sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime())[0].answered_at
              : undefined;

            return {
              ...question,
              times_answered: timesAnswered,
              correct_answers: correctAnswers,
              last_answered: lastAnswered
            };
          }

          return question;
        })
      );

      return questionsWithStats as QuizQuestionWithStats[];
    }

    return (data || []) as QuizQuestion[];
  } catch (error) {
    console.error('Error in fetchQuizQuestionsWithStats:', error);
    throw error;
  }
};

// Fetch a single quiz question by ID
export const fetchQuizQuestionById = async (questionId: string): Promise<QuizQuestion | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) {
      throw new Error(`Error fetching quiz question: ${error.message}`);
    }

    return data as QuizQuestion;
  } catch (error) {
    console.error('Error in fetchQuizQuestionById:', error);
    throw error;
  }
};

// Create a new quiz question
export const createQuizQuestion = async (
  questionData: CreateQuizQuestionData,
  createdBy: string
): Promise<QuizQuestion> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        ...questionData,
        created_by: createdBy
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating quiz question: ${error.message}`);
    }

    return data as QuizQuestion;
  } catch (error) {
    console.error('Error in createQuizQuestion:', error);
    throw error;
  }
};

// Create multiple quiz questions (bulk import)
export const bulkCreateQuizQuestions = async (
  questionsData: Array<CreateQuizQuestionData & { created_by: string }>
): Promise<QuizQuestion[]> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(questionsData)
      .select('*');

    if (error) {
      throw new Error(`Error bulk creating quiz questions: ${error.message}`);
    }

    return (data || []) as QuizQuestion[];
  } catch (error) {
    console.error('Error in bulkCreateQuizQuestions:', error);
    throw error;
  }
};

// Update a quiz question
export const updateQuizQuestion = async (
  questionId: string,
  questionData: UpdateQuizQuestionData
): Promise<QuizQuestion> => {
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(questionData)
      .eq('id', questionId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating quiz question: ${error.message}`);
    }

    return data as QuizQuestion;
  } catch (error) {
    console.error('Error in updateQuizQuestion:', error);
    throw error;
  }
};

// Delete a quiz question
export const deleteQuizQuestion = async (questionId: string): Promise<void> => {
  try {
    // Check if question is used in any attempts
    const { count } = await supabase
      .from('quiz_answers')
      .select('*', { count: 'exact', head: true })
      .eq('question_id', questionId);

    if (count && count > 0) {
      throw new Error('Cannot delete question that has been used in quiz attempts.');
    }

    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      throw new Error(`Error deleting quiz question: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteQuizQuestion:', error);
    throw error;
  }
};

// Get count of quiz questions for a course
export const getQuizQuestionCount = async (courseId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('quiz_questions')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (error) {
      throw new Error(`Error counting quiz questions: ${error.message}`);
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getQuizQuestionCount:', error);
    return 0;
  }
};
