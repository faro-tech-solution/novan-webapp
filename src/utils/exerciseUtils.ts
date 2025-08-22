/**
 * Check if an exercise was created less than 1 week ago
 * @param createdAt - The creation date string from the exercise
 * @returns boolean - true if exercise is less than 1 week old
 */
export const isExerciseNew = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  return createdDate > oneWeekAgo;
};
