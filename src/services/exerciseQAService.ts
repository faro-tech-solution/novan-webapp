import { supabase } from '@/integrations/supabase/client';
import { ExerciseQuestion, CreateQuestionData, VoteData, AdminQuestion, QAManagementFilters, QAManagementStats, ModerationData, BulkModerationData } from '@/types/exerciseQA';

export const fetchQuestions = async (exerciseId: string, courseId: string): Promise<ExerciseQuestion[]> => {
  // First, fetch questions without user data
  const { data: questions, error } = await supabase
    .from('exercise_questions')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('is_deleted', false)
    .is('parent_id', null) // Only get questions, not replies
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching questions:', error);
    throw new Error('Failed to fetch questions');
  }

  if (!questions || questions.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(questions.map(q => q.user_id))];
  
  // Fetch user profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  // Get reply counts for each question
  const questionIds = questions.map(q => q.id);
  const { data: replyCounts } = await supabase
    .from('exercise_questions')
    .select('parent_id')
    .in('parent_id', questionIds)
    .eq('is_deleted', false);

  // Count replies per question
  const replyCountMap = new Map<string, number>();
  if (replyCounts) {
    replyCounts.forEach((reply: any) => {
      const count = replyCountMap.get(reply.parent_id) || 0;
      replyCountMap.set(reply.parent_id, count + 1);
    });
  }

  // Create a map for quick lookup
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  // Map questions with user data and reply counts
  return questions.map((item: any) => {
    const profile = profileMap.get(item.user_id);
    return {
      ...item,
      user: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      } : undefined,
      reply_count: replyCountMap.get(item.id) || 0
    };
  });
};

export const fetchQuestionReplies = async (questionId: string): Promise<ExerciseQuestion[]> => {
  // First, fetch replies without user data
  const { data: replies, error } = await supabase
    .from('exercise_questions')
    .select('*')
    .eq('parent_id', questionId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching replies:', error);
    throw new Error('Failed to fetch replies');
  }

  if (!replies || replies.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(replies.map(q => q.user_id))];
  
  // Fetch user profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  // Create a map for quick lookup
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));

  // Map replies with user data
  return replies.map((item: any) => {
    const profile = profileMap.get(item.user_id);
    return {
      ...item,
      user: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      } : undefined
    };
  });
};

export const createQuestion = async (data: CreateQuestionData, userId: string): Promise<ExerciseQuestion> => {
  const { data: question, error } = await supabase
    .from('exercise_questions')
    .insert({
      ...data,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question');
  }

  return question;
};

export const createReply = async (questionId: string, data: { content: string; course_id: string }, userId: string): Promise<ExerciseQuestion> => {
  // First get the parent question to get exercise_id
  const { data: parentQuestion, error: parentError } = await supabase
    .from('exercise_questions')
    .select('exercise_id')
    .eq('id', questionId)
    .single();

  if (parentError || !parentQuestion) {
    throw new Error('Failed to find parent question');
  }

  const { data: reply, error } = await supabase
    .from('exercise_questions')
    .insert({
      exercise_id: parentQuestion.exercise_id,
      course_id: data.course_id,
      parent_id: questionId,
      content: data.content,
      user_id: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reply:', error);
    throw new Error('Failed to create reply');
  }

  return reply;
};

export const deleteQuestion = async (questionId: string): Promise<void> => {
  const { error } = await supabase
    .from('exercise_questions')
    .update({ is_deleted: true })
    .eq('id', questionId);

  if (error) {
    console.error('Error deleting question:', error);
    throw new Error('Failed to delete question');
  }
};

export const voteQuestion = async (questionId: string, userId: string, voteType: 'upvote' | 'downvote'): Promise<void> => {
  // First check if user has already voted
  const { data: existingVote } = await supabase
    .from('exercise_question_votes')
    .select('vote_type')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single();

  if (existingVote) {
    // If voting the same type, remove the vote
    if (existingVote.vote_type === voteType) {
      await supabase
        .from('exercise_question_votes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', userId);

      // Update vote counts
      const { data: question } = await supabase
        .from('exercise_questions')
        .select('upvotes, downvotes')
        .eq('id', questionId)
        .single();

      if (question) {
        await supabase
          .from('exercise_questions')
          .update({
            upvotes: voteType === 'upvote' ? question.upvotes - 1 : question.upvotes,
            downvotes: voteType === 'downvote' ? question.downvotes - 1 : question.downvotes
          })
          .eq('id', questionId);
      }
      return;
    }

    // If voting different type, update the vote
    await supabase
      .from('exercise_question_votes')
      .update({ vote_type: voteType })
      .eq('question_id', questionId)
      .eq('user_id', userId);

    // Update vote counts (remove old vote, add new vote)
    const { data: question } = await supabase
      .from('exercise_questions')
      .select('upvotes, downvotes')
      .eq('id', questionId)
      .single();

    if (question) {
      await supabase
        .from('exercise_questions')
        .update({
          upvotes: voteType === 'upvote' ? question.upvotes + 1 : question.upvotes - 1,
          downvotes: voteType === 'downvote' ? question.downvotes + 1 : question.downvotes - 1
        })
        .eq('id', questionId);
    }
  } else {
    // Create new vote
    await supabase
      .from('exercise_question_votes')
      .insert({
        question_id: questionId,
        user_id: userId,
        vote_type: voteType
      });

    // Update vote counts
    const { data: question } = await supabase
      .from('exercise_questions')
      .select('upvotes, downvotes')
      .eq('id', questionId)
      .single();

    if (question) {
      await supabase
        .from('exercise_questions')
        .update({
          upvotes: voteType === 'upvote' ? question.upvotes + 1 : question.upvotes,
          downvotes: voteType === 'downvote' ? question.downvotes + 1 : question.downvotes
        })
        .eq('id', questionId);
    }
  }
};

export const getUserVote = async (questionId: string, userId: string): Promise<'upvote' | 'downvote' | null> => {
  const { data } = await supabase
    .from('exercise_question_votes')
    .select('vote_type')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single();

  return data?.vote_type || null;
};

// Admin-specific functions
export const fetchAdminQuestions = async (filters: QAManagementFilters = {}): Promise<AdminQuestion[]> => {
  console.log('fetchAdminQuestions called with filters:', filters);
  
  let query = supabase
    .from('exercise_questions')
    .select('*')
    .eq('is_deleted', false)
    .is('parent_id', null); // Only get questions, not replies

  // Apply filters
  if (filters.courseId) {
    query = query.eq('course_id', filters.courseId);
  }

  if (filters.exerciseId) {
    query = query.eq('exercise_id', filters.exerciseId);
  }

  if (filters.status && filters.status !== 'all') {
    query = query.eq('moderation_status', filters.status);
  }

  if (filters.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,content.ilike.%${filters.searchQuery}%`);
  }

  if (filters.dateRange?.start) {
    query = query.gte('created_at', filters.dateRange.start);
  }

  if (filters.dateRange?.end) {
    query = query.lte('created_at', filters.dateRange.end);
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  console.log('Executing query...');
  const { data: questions, error } = await query;
  
  console.log('Query result:', { questions: questions?.length, error });

  if (error) {
    console.error('Error fetching admin questions:', error);
    throw new Error('Failed to fetch admin questions');
  }

  if (!questions || questions.length === 0) {
    console.log('No questions found in database');
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(questions.map(q => q.user_id))];
  
  // Fetch user profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .in('id', userIds);

  // Get exercise details
  const exerciseIds = [...new Set(questions.map(q => q.exercise_id))];
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, title, course_id')
    .in('id', exerciseIds);

  // Get course details
  const courseIds = [...new Set(questions.map(q => q.course_id))];
  const { data: courses } = await supabase
    .from('courses')
    .select('id, name')
    .in('id', courseIds);

  // Get reply counts for each question
  const questionIds = questions.map(q => q.id);
  const { data: replyCounts } = await supabase
    .from('exercise_questions')
    .select('parent_id')
    .in('parent_id', questionIds)
    .eq('is_deleted', false);

  // Count replies per question
  const replyCountMap = new Map<string, number>();
  if (replyCounts) {
    replyCounts.forEach((reply: any) => {
      const count = replyCountMap.get(reply.parent_id) || 0;
      replyCountMap.set(reply.parent_id, count + 1);
    });
  }

  // Create maps for quick lookup
  const profileMap = new Map((profiles || []).map(p => [p.id, p]));
  const exerciseMap = new Map((exercises || []).map(e => [e.id, e]));
  const courseMap = new Map((courses || []).map(c => [c.id, c]));

  // Map questions with user data and reply counts
  return questions.map((item: any) => {
    const profile = profileMap.get(item.user_id);
    const exercise = exerciseMap.get(item.exercise_id);
    const course = courseMap.get(item.course_id);
    
    return {
      ...item,
      user: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email
      } : undefined,
      profiles: profile, // Also include the full profile object
      exercise: exercise ? {
        id: exercise.id,
        title: exercise.title,
        course_id: exercise.course_id
      } : undefined,
      course: course ? {
        id: course.id,
        name: course.name
      } : undefined,
      reply_count: item.reply_count || replyCountMap.get(item.id) || 0,
      // Moderation fields are now part of the database schema
      moderation_status: item.moderation_status || 'pending',
      is_pinned: item.is_pinned || false,
      is_resolved: item.is_resolved || false,
      admin_notes: item.admin_notes || null,
      moderated_by: item.moderated_by || null,
      moderated_at: item.moderated_at || null
    };
  });
};

export const fetchQAManagementStats = async (): Promise<QAManagementStats> => {
  // Get total questions count
  const { count: totalQuestions } = await supabase
    .from('exercise_questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .is('parent_id', null);

  // Get all main questions first
  const { data: allMainQuestions } = await supabase
    .from('exercise_questions')
    .select('id')
    .eq('is_deleted', false)
    .is('parent_id', null);

  // Get questions that have replies
  const { data: questionsWithReplies } = await supabase
    .from('exercise_questions')
    .select('parent_id')
    .not('parent_id', 'is', null)
    .eq('is_deleted', false);

  const mainQuestionIds = allMainQuestions?.map(q => q.id) || [];
  const repliedQuestionIds = [...new Set(questionsWithReplies?.map(r => r.parent_id) || [])];
  
  // Get pending questions count (questions with pending moderation status)
  const { count: pendingQuestions } = await supabase
    .from('exercise_questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .is('parent_id', null)
    .eq('moderation_status', 'pending');

  // Get resolved questions count (questions marked as resolved)
  const { count: resolvedQuestions } = await supabase
    .from('exercise_questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .is('parent_id', null)
    .eq('is_resolved', true);

  // Get flagged questions count (questions with flagged moderation status)
  const { count: flaggedQuestions } = await supabase
    .from('exercise_questions')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .is('parent_id', null)
    .eq('moderation_status', 'flagged');

  // Get most active exercises (simplified approach)
  const { data: questionCounts } = await supabase
    .from('exercise_questions')
    .select('exercise_id')
    .eq('is_deleted', false)
    .is('parent_id', null);

  // Count questions per exercise
  const exerciseCounts = new Map<string, number>();
  questionCounts?.forEach(q => {
    const count = exerciseCounts.get(q.exercise_id) || 0;
    exerciseCounts.set(q.exercise_id, count + 1);
  });

  // Get exercise details for top 5
  const topExerciseIds = Array.from(exerciseCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, title')
    .in('id', topExerciseIds);

  const mostActiveExercises = topExerciseIds.map(exerciseId => {
    const exercise = exercises?.find(e => e.id === exerciseId);
    return {
      exercise_id: exerciseId,
      exercise_title: exercise?.title || 'نامشخص',
      question_count: exerciseCounts.get(exerciseId) || 0
    };
  });

  // Calculate average response time (simplified - time between question and first reply)
  const { data: responseTimes } = await supabase
    .from('exercise_questions')
    .select(`
      created_at,
      parent_id,
      parent:exercise_questions!parent_id(created_at)
    `)
    .not('parent_id', 'is', null)
    .eq('is_deleted', false);

  let averageResponseTime = 0;
  if (responseTimes && responseTimes.length > 0) {
    const times = responseTimes
      .filter(rt => rt.parent)
      .map(rt => {
        const questionTime = new Date(rt.parent.created_at).getTime();
        const replyTime = new Date(rt.created_at).getTime();
        return replyTime - questionTime;
      })
      .filter(time => time > 0);

    if (times.length > 0) {
      averageResponseTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      averageResponseTime = averageResponseTime / (1000 * 60 * 60); // Convert to hours
    }
  }

  return {
    totalQuestions: totalQuestions || 0,
    pendingQuestions: pendingQuestions || 0,
    resolvedQuestions: resolvedQuestions || 0,
    flaggedQuestions: flaggedQuestions || 0,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100, // Round to 2 decimal places
    mostActiveExercises: mostActiveExercises
  };
};

// New moderation functions using the database function
export const moderateQuestion = async (questionId: string, action: string, adminNotes?: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('moderate_question', {
    question_id: questionId,
    action: action,
    admin_notes: adminNotes
  });

  if (error) {
    console.error('Error moderating question:', error);
    throw new Error(error.message || 'Failed to moderate question');
  }

  return data;
};

export const bulkModerateQuestions = async (questionIds: string[], action: string): Promise<{ success: boolean; processedCount: number }> => {
  try {
    if (action === 'delete') {
      const { error } = await supabase
        .from('exercise_questions')
        .update({ is_deleted: true })
        .in('id', questionIds);

      if (error) {
        console.error('Error bulk deleting questions:', error);
        throw new Error('Failed to delete questions');
      }
    } else {
      // Use individual moderation for each question
      for (const questionId of questionIds) {
        await moderateQuestion(questionId, action);
      }
    }

    return { success: true, processedCount: questionIds.length };
  } catch (error) {
    console.error('Error in bulk moderation:', error);
    throw error;
  }
};
