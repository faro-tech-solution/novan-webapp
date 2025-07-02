/**
 * @deprecated Use hooks from '@/hooks/queries/useReviewSubmissionsQuery' instead
 */
import { 
  useSubmissionsQuery as useSubmissionsQueryNew,
  useCoursesForReviewQuery,
  useGradeSubmissionMutation as useGradeSubmissionMutationNew
} from './queries/useReviewSubmissionsQuery';

/**
 * @deprecated Use hooks from '@/hooks/queries/useReviewSubmissionsQuery' instead
 */
export const useSubmissionsQuery = () => {
  console.warn('This hook is deprecated. Use the one from @/hooks/queries/useReviewSubmissionsQuery instead');
  return useSubmissionsQueryNew();
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useReviewSubmissionsQuery' instead
 */
export const useCoursesQuery = () => {
  console.warn('This hook is deprecated. Use useCoursesForReviewQuery from @/hooks/queries/useReviewSubmissionsQuery instead');
  return useCoursesForReviewQuery();
};

/**
 * @deprecated Use hooks from '@/hooks/queries/useReviewSubmissionsQuery' instead
 */
export const useGradeSubmissionMutation = () => {
  console.warn('This hook is deprecated. Use the one from @/hooks/queries/useReviewSubmissionsQuery instead');
  return useGradeSubmissionMutationNew();
};
