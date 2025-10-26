import { supabase } from '@/integrations/supabase/client';
import { ExerciseQuestion, CreateQuestionData, VoteData } from '@/types/exerciseQA';

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
