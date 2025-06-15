
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { logStudentActivity, ACTIVITY_TYPES } from '@/services/activityLogService';

// Generate a session ID that persists for the browser session
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('student_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('student_session_id', sessionId);
  }
  return sessionId;
};

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = useCallback(async (
    activityType: string,
    activityData?: any,
    pointsEarned: number = 0,
    durationMinutes: number = 0
  ) => {
    if (!user) return;

    const sessionId = getSessionId();

    await logStudentActivity({
      student_id: user.id,
      activity_type: activityType,
      activity_data: activityData,
      points_earned: pointsEarned,
      session_id: sessionId,
      duration_minutes: durationMinutes
    });
  }, [user]);

  // Convenience methods for common activities
  const logLogin = useCallback(() => {
    logActivity(ACTIVITY_TYPES.LOGIN, { timestamp: new Date().toISOString() }, 5);
  }, [logActivity]);

  const logPageVisit = useCallback((pageName: string) => {
    logActivity(ACTIVITY_TYPES.PAGE_VISIT, { page: pageName }, 1);
  }, [logActivity]);

  const logExerciseView = useCallback((exerciseId: string, exerciseTitle: string) => {
    logActivity(ACTIVITY_TYPES.EXERCISE_VIEW, { 
      exercise_id: exerciseId, 
      exercise_title: exerciseTitle 
    }, 2);
  }, [logActivity]);

  const logExerciseStart = useCallback((exerciseId: string, exerciseTitle: string) => {
    logActivity(ACTIVITY_TYPES.EXERCISE_START, { 
      exercise_id: exerciseId, 
      exercise_title: exerciseTitle 
    }, 5);
  }, [logActivity]);

  const logExerciseComplete = useCallback((exerciseId: string, exerciseTitle: string, score: number, pointsEarned: number) => {
    logActivity(ACTIVITY_TYPES.EXERCISE_COMPLETE, { 
      exercise_id: exerciseId, 
      exercise_title: exerciseTitle,
      score: score 
    }, pointsEarned);
  }, [logActivity]);

  const logStudySession = useCallback((durationMinutes: number, activitiesCount: number = 1) => {
    const pointsEarned = Math.min(Math.floor(durationMinutes / 5), 20); // 1 point per 5 minutes, max 20 points
    logActivity(ACTIVITY_TYPES.STUDY_SESSION, { 
      activities_count: activitiesCount 
    }, pointsEarned, durationMinutes);
  }, [logActivity]);

  const logLogout = useCallback(() => {
    logActivity(ACTIVITY_TYPES.LOGOUT, { timestamp: new Date().toISOString() });
  }, [logActivity]);

  return {
    logActivity,
    logLogin,
    logPageVisit,
    logExerciseView,
    logExerciseStart,
    logExerciseComplete,
    logStudySession,
    logLogout
  };
};
