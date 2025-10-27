/**
 * Event-related constants and utility functions
 */

export const EVENT_STATUSES = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type EventStatus = typeof EVENT_STATUSES[keyof typeof EVENT_STATUSES];

/**
 * Get the badge variant for event status
 */
export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case EVENT_STATUSES.UPCOMING: return 'default';
    case EVENT_STATUSES.ONGOING: return 'secondary';
    case EVENT_STATUSES.COMPLETED: return 'outline';
    case EVENT_STATUSES.CANCELLED: return 'destructive';
    default: return 'default';
  }
};

/**
 * Get the Persian text for event status
 */
export const getStatusText = (status: string) => {
  switch (status) {
    case EVENT_STATUSES.UPCOMING: return 'آینده';
    case EVENT_STATUSES.ONGOING: return 'در حال برگزاری';
    case EVENT_STATUSES.COMPLETED: return 'تکمیل شده';
    case EVENT_STATUSES.CANCELLED: return 'لغو شده';
    default: return status;
  }
};

/**
 * Get the Persian text for event status (with "events" prefix for filters)
 */
export const getStatusTextWithEvents = (status: string) => {
  switch (status) {
    case EVENT_STATUSES.UPCOMING: return 'رویدادهای آینده';
    case EVENT_STATUSES.ONGOING: return 'رویدادهای در حال برگزاری';
    case EVENT_STATUSES.COMPLETED: return 'رویدادهای تکمیل شده';
    case 'all': return 'همه رویدادها';
    default: return status;
  }
};

/**
 * Format date for display (full format with year)
 */
export const formatEventDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format date for display (short format for cards)
 */
export const formatEventDateShort = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
