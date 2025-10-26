export interface ExerciseQuestion {
  id: string;
  exercise_id: string;
  course_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email?: string;
  };
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  reply_count?: number;
  user_vote?: 'upvote' | 'downvote' | null;
}

export interface QuestionVote {
  id: string;
  question_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface CreateQuestionData {
  exercise_id: string;
  course_id: string;
  content: string;
  parent_id?: string | null;
}

export interface VoteData {
  question_id: string;
  vote_type: 'upvote' | 'downvote';
}
