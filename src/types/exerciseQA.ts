export interface ExerciseQuestion {
    id: string;
    exercise_id: string;
    course_id: string;
    user_id: string;
    parent_id: string | null;
    title: string | null;
    content: string;
    upvotes: number;
    downvotes: number;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    // Moderation fields
    moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged';
    is_pinned: boolean;
    is_resolved: boolean;
    admin_notes: string | null;
    moderated_by: string | null;
    moderated_at: string | null;
    reply_count: number;
    // User data
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
    title?: string | null;
    content: string;
    parent_id?: string | null;
  }
  
  export interface VoteData {
    question_id: string;
    vote_type: 'upvote' | 'downvote';
  }
  
  // Admin-specific types for Q&A management
  export interface AdminQuestion extends ExerciseQuestion {
    exercise?: {
      id: string;
      title: string;
      course_id: string;
    };
    course?: {
      id: string;
      name: string;
    };
    // Moderation fields are now part of base ExerciseQuestion interface
  }
  
  export interface QAManagementFilters {
    courseId?: string;
    exerciseId?: string;
    status?: 'all' | 'pending' | 'approved' | 'rejected' | 'flagged';
    dateRange?: {
      start: string;
      end: string;
    };
    searchQuery?: string;
    sortBy?: 'created_at' | 'upvotes' | 'downvotes' | 'reply_count';
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface QAManagementStats {
    totalQuestions: number;
    pendingQuestions: number;
    resolvedQuestions: number;
    flaggedQuestions: number;
    averageResponseTime: number;
    mostActiveExercises: Array<{
      exercise_id: string;
      exercise_title: string;
      question_count: number;
    }>;
  }
  
  // Moderation action types
  export type ModerationAction = 
    | 'approve' 
    | 'reject' 
    | 'flag' 
    | 'pin' 
    | 'unpin' 
    | 'resolve' 
    | 'unresolve';
  
  export interface ModerationData {
    questionId: string;
    action: ModerationAction;
    adminNotes?: string;
  }
  
  export interface BulkModerationData {
    questionIds: string[];
    action: 'approve' | 'reject' | 'delete';
  }