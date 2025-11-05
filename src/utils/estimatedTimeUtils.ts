/**
 * Estimated time utility functions
 * Database stores time as seconds (string or number)
 * These utilities handle conversion and formatting for display
 */

import { formatDuration } from './exerciseStatsUtils';

/**
 * Format estimated time from seconds to a displayable time string
 * @param estimatedTime - Time in seconds (can be string or number)
 * @param format - Optional format parameter ('time' for MM:SS format, default for Persian text)
 * @returns Formatted time string
 */
export const formatEstimatedTime = (estimatedTime: string | number | null, format?: 'time'): string => {
  if (!estimatedTime || estimatedTime === '0' || estimatedTime === 0) {
    return format === 'time' ? '00:00' : '0 دقیقه';
  }

  // Parse the time to seconds
  const timeInSeconds = typeof estimatedTime === 'string' ? parseFloat(estimatedTime) : estimatedTime;
  
  if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
    return format === 'time' ? '00:00' : '0 دقیقه';
  }

  // Convert to minutes
  const timeInMinutes = timeInSeconds / 60;

  // Use formatDuration for consistent formatting
  return formatDuration(timeInMinutes, format);
};

/**
 * Convert estimated time from seconds to minutes
 * @param estimatedTime - Time in seconds (can be string or number)
 * @returns Time in minutes
 */
export const estimatedTimeToMinutes = (estimatedTime: string | number | null): number => {
  if (!estimatedTime || estimatedTime === '0' || estimatedTime === 0) {
    return 0;
  }

  const timeInSeconds = typeof estimatedTime === 'string' ? parseFloat(estimatedTime) : estimatedTime;
  
  if (isNaN(timeInSeconds) || timeInSeconds <= 0) {
    return 0;
  }

  return timeInSeconds / 60;
};

/**
 * Convert estimated time from seconds to hours
 * @param estimatedTime - Time in seconds (can be string or number)
 * @returns Time in hours
 */
export const estimatedTimeToHours = (estimatedTime: string | number | null): number => {
  return estimatedTimeToMinutes(estimatedTime) / 60;
};

/**
 * Parse estimated time and return as number of seconds
 * @param estimatedTime - Time in seconds (can be string or number)
 * @returns Time in seconds as number
 */
export const parseEstimatedTime = (estimatedTime: string | number | null): number => {
  if (!estimatedTime || estimatedTime === '0' || estimatedTime === 0) {
    return 0;
  }

  const timeInSeconds = typeof estimatedTime === 'string' ? parseFloat(estimatedTime) : estimatedTime;
  
  return isNaN(timeInSeconds) ? 0 : timeInSeconds;
};

/**
 * Check if estimated time is valid
 * @param estimatedTime - Time in seconds (can be string or number)
 * @returns true if valid, false otherwise
 */
export const isValidEstimatedTime = (estimatedTime: string | number | null): boolean => {
  if (!estimatedTime) {
    return false;
  }

  const timeInSeconds = typeof estimatedTime === 'string' ? parseFloat(estimatedTime) : estimatedTime;
  
  return !isNaN(timeInSeconds) && timeInSeconds >= 0;
};