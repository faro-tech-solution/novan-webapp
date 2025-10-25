/**
 * Submission status translation utilities
 * Database stores: not_started | pending | completed
 * Frontend displays: شروع نشده | در انتظار بررسی | تکمیل شده (Persian)
 */

export type SubmissionStatusType = 'not_started' | 'pending' | 'completed';

export const SUBMISSION_STATUS_TRANSLATIONS = {
  not_started: 'شروع نشده',
  pending: 'در انتظار بررسی',
  completed: 'تکمیل شده'
} as const;

export const SUBMISSION_STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800'
} as const;

export const SUBMISSION_STATUS_HOVER_COLORS = {
  not_started: 'hover:bg-gray-800 hover:text-gray-100',
  pending: 'hover:bg-yellow-800 hover:text-yellow-100',
  completed: 'hover:bg-green-800 hover:text-green-100'
} as const;

/**
 * Translates English submission status to Persian for display
 */
export const translateSubmissionStatusToDisplay = (status: string | null): string => {
  if (!status) {
    return 'نامشخص';
  }
  
  return SUBMISSION_STATUS_TRANSLATIONS[status as SubmissionStatusType] || status;
};

/**
 * Get the color class for a submission status
 */
export const getSubmissionStatusColor = (status: string | null): string => {
  if (!status) {
    return 'bg-gray-100 text-gray-800';
  }
  
  return SUBMISSION_STATUS_COLORS[status as SubmissionStatusType] || 'bg-gray-100 text-gray-800';
};

/**
 * Get the hover color class for a submission status
 */
export const getSubmissionStatusHoverColor = (status: string | null): string => {
  if (!status) {
    return 'hover:bg-foreground hover:text-background';
  }
  
  return SUBMISSION_STATUS_HOVER_COLORS[status as SubmissionStatusType] || 'hover:bg-foreground hover:text-background';
};

/**
 * Validates if a submission status value is valid
 */
export const isValidSubmissionStatus = (status: string | null): status is SubmissionStatusType | null => {
  if (status === null) return true;
  return ['not_started', 'pending', 'completed'].includes(status);
};
