import { SubmissionStudent } from './student';

// =====================================
// Base Database Table Interfaces
// =====================================

/**
 * Exercise Q&A table - stores questions, answers, and replies
 */
export interface ExerciseQA {
  id: string;
  title: string | null; // Only for main questions, null for answers/replies
  description: string;
  exercise_id: string;
  user_id: string;
  parent_id: string | null; // NULL for main questions, references parent for answers/replies
  vote_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Exercise Q&A Vote table - tracks user votes (upvote +1, downvote -1)
 */
export interface ExerciseQAVote {
  id: string;
  exercise_qa_id: string;
  user_id: string;
  vote_type: 1 | -1; // 1 for upvote, -1 for downvote
  created_at: string;
}

/**
 * Exercise Q&A Bookmark table - tracks user bookmarks
 */
export interface ExerciseQABookmark {
  id: string;
  qa_id: string;
  user_id: string;
  created_at: string;
}

// =====================================
// Extended Interfaces for Joined Data
// =====================================

/**
 * Q&A post with user information
 */
export interface ExerciseQAWithUser extends ExerciseQA {
  user: SubmissionStudent;
}

/**
 * Q&A post with complete details including user, votes, and bookmark status
 */
export interface ExerciseQAWithDetails extends ExerciseQA {
  user: SubmissionStudent;
  user_vote: ExerciseQAVote | null; // Current user's vote on this post
  is_bookmarked: boolean; // Whether current user has bookmarked this post
  replies?: ExerciseQAWithDetails[]; // Nested replies for threaded display
}

/**
 * Q&A post for display in lists
 */
export interface ExerciseQAListItem extends ExerciseQA {
  user: SubmissionStudent;
  reply_count: number; // Total number of replies
  is_bookmarked: boolean;
  user_vote: 1 | -1 | null; // User's vote: 1 (upvote), -1 (downvote), null (no vote)
}

// =====================================
// Request/Response Types
// =====================================

/**
 * Data for creating a new question
 */
export interface CreateQuestionData {
  title: string;
  description: string;
  exercise_id: string;
}

/**
 * Data for creating an answer or reply
 */
export interface CreateAnswerData {
  description: string;
  exercise_id: string;
  parent_id: string; // ID of the question or answer being replied to
}

/**
 * Data for updating a Q&A post
 */
export interface UpdateQAData {
  title?: string; // Only for questions
  description?: string;
}

/**
 * Data for voting operations
 */
export interface VoteData {
  qa_id: string;
  vote_type: 1 | -1; // 1 for upvote, -1 for downvote
}

/**
 * Data for bookmark operations
 */
export interface BookmarkData {
  qa_id: string;
}

// =====================================
// Utility Types
// =====================================

/**
 * Vote status for UI display
 */
export type VoteStatus = 'upvoted' | 'downvoted' | 'none';

/**
 * Q&A post type identifier
 */
export type QAPostType = 'question' | 'answer' | 'reply';

