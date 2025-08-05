'use client';

import { useRouter } from 'next/navigation';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';

export function useGoToTraineeCourseDashboard() {
  const router = useRouter();
  const { trainee: { setCourseId } } = useDashboardPanelContext();

  return (courseId: string) => {
    setCourseId(courseId);
    router.push(`/trainee/${courseId}/dashboard`);
  };
} 