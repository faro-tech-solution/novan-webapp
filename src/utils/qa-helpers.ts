import { 
  ExerciseQAWithDetails, 
  ExerciseQAVote,
  VoteStatus 
} from '@/types/qa';
import { SubmissionStudent } from '@/types/student';

/**
 * Extract the current user's vote from Q&A data
 * @param qaItem - The Q&A item with potential vote information
 * @returns The vote type (1, -1) or null if no vote exists
 * @example
 * const userVote = getUserVote(qaItem);
 * if (userVote === 1) console.log('User upvoted');
 */
export const getUserVote = (
  qaItem: ExerciseQAWithDetails
): 1 | -1 | null => {
  if (!qaItem.user_vote) {
    return null;
  }
  return qaItem.user_vote.vote_type;
};

/**
 * Get vote status as a user-friendly string
 * @param qaItem - The Q&A item with potential vote information
 * @returns VoteStatus - 'upvoted', 'downvoted', or 'none'
 * @example
 * const status = getVoteStatus(qaItem);
 * if (status === 'upvoted') showUpvoteAnimation();
 */
export const getVoteStatus = (
  qaItem: ExerciseQAWithDetails
): VoteStatus => {
  const vote = getUserVote(qaItem);
  if (vote === 1) return 'upvoted';
  if (vote === -1) return 'downvoted';
  return 'none';
};

/**
 * Check if a Q&A post is bookmarked by the current user
 * @param qaItem - The Q&A item with bookmark information
 * @returns boolean - true if bookmarked, false otherwise
 * @example
 * const bookmarked = isBookmarked(qaItem);
 * setBookmarkIcon(bookmarked ? 'filled' : 'outline');
 */
export const isBookmarked = (
  qaItem: ExerciseQAWithDetails
): boolean => {
  return qaItem.is_bookmarked === true;
};

/**
 * Build user's full name from profile data
 * @param user - User profile with first_name and last_name
 * @param fallback - Optional fallback text if names are not available
 * @returns string - Full name or fallback text
 * @example
 * const name = getUserFullName(user);
 * console.log(name); // "John Doe"
 * 
 * const nameWithFallback = getUserFullName(user, "Anonymous");
 * console.log(nameWithFallback); // "Anonymous" if no names
 */
export const getUserFullName = (
  user: SubmissionStudent,
  fallback: string = 'کاربر ناشناس'
): string => {
  if (!user) {
    return fallback;
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (!firstName && !lastName) {
    return fallback;
  }

  // Combine first and last name with a space
  return `${firstName} ${lastName}`.trim();
};

/**
 * Get user initials for avatar display
 * @param user - User profile with first_name and last_name
 * @returns string - User initials (e.g., "JD" for John Doe)
 * @example
 * const initials = getUserInitials(user);
 * console.log(initials); // "JD"
 */
export const getUserInitials = (
  user: SubmissionStudent
): string => {
  if (!user) {
    return '??';
  }

  const firstName = user.first_name?.trim() || '';
  const lastName = user.last_name?.trim() || '';

  if (!firstName && !lastName) {
    return '??';
  }

  const firstInitial = firstName.charAt(0).toUpperCase();
  const lastInitial = lastName.charAt(0).toUpperCase();

  return `${firstInitial}${lastInitial}`;
};

/**
 * Transform a flat list of Q&A items into a hierarchical tree structure
 * for nested display of questions, answers, and replies
 * @param qaList - Flat array of Q&A items with parent_id relationships
 * @returns Array of root-level Q&A items with nested replies
 * @example
 * const flatList = await fetchQAList(exerciseId);
 * const tree = buildQATree(flatList);
 * // tree[0].replies contains all direct answers
 * // tree[0].replies[0].replies contains all replies to first answer
 */
export const buildQATree = (
  qaList: ExerciseQAWithDetails[]
): ExerciseQAWithDetails[] => {
  if (!qaList || qaList.length === 0) {
    return [];
  }

  // Create a map for quick lookup by ID
  const qaMap = new Map<string, ExerciseQAWithDetails>();
  
  // Initialize all items with empty replies array
  qaList.forEach(item => {
    qaMap.set(item.id, { ...item, replies: [] });
  });

  // Separate root items (questions) from nested items (answers/replies)
  const rootItems: ExerciseQAWithDetails[] = [];

  qaList.forEach(item => {
    const qaItem = qaMap.get(item.id)!;

    if (item.parent_id === null) {
      // Root level question
      rootItems.push(qaItem);
    } else {
      // This is an answer or reply, add it to parent's replies
      const parent = qaMap.get(item.parent_id);
      if (parent) {
        if (!parent.replies) {
          parent.replies = [];
        }
        parent.replies.push(qaItem);
      }
    }
  });

  // Sort root items by creation date (newest first)
  rootItems.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Sort replies within each item recursively
  const sortReplies = (item: ExerciseQAWithDetails) => {
    if (item.replies && item.replies.length > 0) {
      // Sort by vote_count (highest first), then by creation date
      item.replies.sort((a, b) => {
        if (b.vote_count !== a.vote_count) {
          return b.vote_count - a.vote_count;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      // Recursively sort nested replies
      item.replies.forEach(sortReplies);
    }
  };

  rootItems.forEach(sortReplies);

  return rootItems;
};

/**
 * Get the depth level of a Q&A item in the tree
 * Used for styling nested replies with different indentation
 * @param qaItem - Q&A item
 * @param qaList - Complete flat list of Q&A items
 * @returns number - Depth level (0 for questions, 1 for answers, 2+ for nested replies)
 * @example
 * const depth = getQADepth(qaItem, qaList);
 * const indentation = depth * 20; // 20px per level
 */
export const getQADepth = (
  qaItem: ExerciseQAWithDetails,
  qaList: ExerciseQAWithDetails[]
): number => {
  let depth = 0;
  let currentItem = qaItem;

  while (currentItem.parent_id !== null) {
    depth++;
    const parent = qaList.find(item => item.id === currentItem.parent_id);
    if (!parent) break;
    currentItem = parent;
  }

  return depth;
};

/**
 * Get the type of Q&A post
 * @param qaItem - Q&A item
 * @returns 'question' | 'answer' | 'reply'
 * @example
 * const type = getQAPostType(qaItem);
 * if (type === 'question') showQuestionIcon();
 */
export const getQAPostType = (
  qaItem: ExerciseQAWithDetails
): 'question' | 'answer' | 'reply' => {
  if (qaItem.parent_id === null) {
    return 'question';
  }
  
  // Check if this is a direct answer to a question or a reply to an answer
  // We need the parent to determine this, but for simplicity:
  // If it has a title, it's a question
  // If parent_id is not null, it's either an answer or reply
  if (qaItem.title !== null) {
    return 'question';
  }
  
  return 'answer'; // Simplified: treat all non-questions as answers
};

/**
 * Count total replies for a Q&A item (including nested replies)
 * @param qaItem - Q&A item with replies
 * @returns number - Total count of all replies at all levels
 * @example
 * const totalReplies = countTotalReplies(qaItem);
 * console.log(`${totalReplies} replies`);
 */
export const countTotalReplies = (
  qaItem: ExerciseQAWithDetails
): number => {
  if (!qaItem.replies || qaItem.replies.length === 0) {
    return 0;
  }

  let count = qaItem.replies.length;
  
  qaItem.replies.forEach(reply => {
    count += countTotalReplies(reply);
  });

  return count;
};

/**
 * Format Q&A creation date for display
 * @param createdAt - ISO date string
 * @param locale - Optional locale ('fa' for Persian, 'en' for English)
 * @returns string - Formatted relative time (e.g., "2 hours ago", "۲ ساعت پیش")
 * @example
 * const timeAgo = formatQADate(qaItem.created_at, 'fa');
 * console.log(timeAgo); // "۲ ساعت پیش"
 */
export const formatQADate = (
  createdAt: string,
  locale: 'fa' | 'en' = 'fa'
): string => {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return locale === 'fa' ? 'لحظاتی پیش' : 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
};

/**
 * Check if current user is the author of a Q&A post
 * @param qaItem - Q&A item
 * @param currentUserId - Current user's ID
 * @returns boolean - true if current user is the author
 * @example
 * const canEdit = isCurrentUserAuthor(qaItem, userId);
 * if (canEdit) showEditButton();
 */
export const isCurrentUserAuthor = (
  qaItem: ExerciseQAWithDetails,
  currentUserId: string
): boolean => {
  return qaItem.user_id === currentUserId;
};

/**
 * Validate Q&A question data before submission
 * @param title - Question title
 * @param description - Question description
 * @returns Object with isValid boolean and error message if invalid
 * @example
 * const validation = validateQuestionData(title, description);
 * if (!validation.isValid) showError(validation.error);
 */
export const validateQuestionData = (
  title: string,
  description: string
): { isValid: boolean; error?: string } => {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();

  if (!trimmedTitle) {
    return { 
      isValid: false, 
      error: 'عنوان سؤال نمی‌تواند خالی باشد' 
    };
  }

  if (trimmedTitle.length < 10) {
    return { 
      isValid: false, 
      error: 'عنوان سؤال باید حداقل ۱۰ کاراکتر باشد' 
    };
  }

  if (trimmedTitle.length > 200) {
    return { 
      isValid: false, 
      error: 'عنوان سؤال نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد' 
    };
  }

  if (!trimmedDescription) {
    return { 
      isValid: false, 
      error: 'توضیحات سؤال نمی‌تواند خالی باشد' 
    };
  }

  if (trimmedDescription.length < 20) {
    return { 
      isValid: false, 
      error: 'توضیحات سؤال باید حداقل ۲۰ کاراکتر باشد' 
    };
  }

  if (trimmedDescription.length > 5000) {
    return { 
      isValid: false, 
      error: 'توضیحات سؤال نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' 
    };
  }

  return { isValid: true };
};

/**
 * Validate Q&A answer/reply data before submission
 * @param description - Answer/reply description
 * @returns Object with isValid boolean and error message if invalid
 * @example
 * const validation = validateAnswerData(description);
 * if (!validation.isValid) showError(validation.error);
 */
export const validateAnswerData = (
  description: string
): { isValid: boolean; error?: string } => {
  const trimmedDescription = description.trim();

  if (!trimmedDescription) {
    return { 
      isValid: false, 
      error: 'پاسخ نمی‌تواند خالی باشد' 
    };
  }

  if (trimmedDescription.length < 10) {
    return { 
      isValid: false, 
      error: 'پاسخ باید حداقل ۱۰ کاراکتر باشد' 
    };
  }

  if (trimmedDescription.length > 5000) {
    return { 
      isValid: false, 
      error: 'پاسخ نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' 
    };
  }

  return { isValid: true };
};

