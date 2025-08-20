/**
 * Utility functions for handling exercise order calculations and display
 */

/**
 * Calculate the display number from order_index
 * order_index is calculated as: (category_order * 1000) + exercise_order_in_category
 * This function extracts the exercise number within the category
 * Display number is order_index + 1 so that order_index = 0 shows as "1. Exercise Title"
 */
export const getExerciseDisplayNumber = (orderIndex: number): number => {
  // Extract the exercise order within category (last 3 digits) and add 1 for display
  return (orderIndex % 1000) + 1;
};

/**
 * Calculate the display number based on position in a sorted list
 * This provides continuous numbering across all categories
 * @param exercises - Array of exercises sorted by order_index
 * @param exerciseId - ID of the exercise to get display number for
 * @returns Display number (1-based index in the sorted list)
 */
export const getExerciseDisplayNumberFromList = (exercises: any[], exerciseId: string): number => {
  const index = exercises.findIndex(ex => ex.id === exerciseId);
  return index >= 0 ? index + 1 : 1;
};

/**
 * Calculate the category order from order_index
 */
export const getCategoryOrder = (orderIndex: number): number => {
  // Extract the category order (first part before the last 3 digits)
  return Math.floor(orderIndex / 1000);
};

/**
 * Format exercise title with number: "{number}. {title}"
 */
export const formatExerciseTitleWithNumber = (title: string, orderIndex: number): string => {
  const displayNumber = getExerciseDisplayNumber(orderIndex);
  return `${displayNumber}. ${title}`;
};

/**
 * Format exercise title with number based on position in list: "{number}. {title}"
 * This provides continuous numbering across all categories
 */
export const formatExerciseTitleWithNumberFromList = (title: string, exercises: any[], exerciseId: string): string => {
  const displayNumber = getExerciseDisplayNumberFromList(exercises, exerciseId);
  return `${displayNumber}. ${title}`;
};

/**
 * Calculate order_index for a new exercise based on category order and exercise order within category
 */
export const calculateOrderIndex = (
  categoryOrder: number, 
  exerciseOrderInCategory: number
): number => {
  return (categoryOrder * 1000) + exerciseOrderInCategory;
};

/**
 * Check if an exercise is uncategorized (has high order_index)
 */
export const isUncategorizedExercise = (orderIndex: number): boolean => {
  return orderIndex >= 999999;
};
