import { useNavigate } from 'react-router-dom';
import { useDashboardPanelContext } from '@/contexts/DashboardPanelContext';

export function useGoToTraineeCourseDashboard() {
  const navigate = useNavigate();
  const { trainee: { setCourseId } } = useDashboardPanelContext();

  return (courseId: string) => {
    setCourseId(courseId);
    navigate(`/trainee/${courseId}/dashboard`);
  };
} 