/**
 * Difficulty translation utilities
 * Database stores: easy | medium | hard (English)
 * Frontend displays: آسان | متوسط | سخت (Persian)
 */

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_TRANSLATIONS = {
  easy: 'آسان',
  medium: 'متوسط',
  hard: 'سخت'
} as const;

export const DIFFICULTY_REVERSE_TRANSLATIONS = {
  'آسان': 'easy',
  'متوسط': 'medium',
  'سخت': 'hard'
} as const;

/**
 * Translates English difficulty to Persian for display
 */
export const translateDifficultyToDisplay = (difficulty: string | null): string => {
  if (!difficulty) {
    return 'نامشخص';
  }
  
  return DIFFICULTY_TRANSLATIONS[difficulty as DifficultyLevel] || difficulty;
};

/**
 * Translates Persian difficulty to English for database storage
 */
export const translateDifficultyToStorage = (difficulty: string | null): string | null => {
  if (!difficulty) {
    return null;
  }
  
  return DIFFICULTY_REVERSE_TRANSLATIONS[difficulty as keyof typeof DIFFICULTY_REVERSE_TRANSLATIONS] || difficulty;
};

/**
 * Get all available difficulty options for forms (Persian labels, English values)
 */
export const getDifficultyOptions = () => [
  { label: 'آسان', value: 'easy' },
  { label: 'متوسط', value: 'medium' },
  { label: 'سخت', value: 'hard' }
];

/**
 * Validates if a difficulty value is valid English format
 */
export const isValidDifficultyValue = (difficulty: string | null): difficulty is DifficultyLevel | null => {
  if (difficulty === null) return true;
  return ['easy', 'medium', 'hard'].includes(difficulty);
};
