
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

// Check if user has already logged activity today
const hasLoggedTodayActivity = async (userId: string, activityType: string): Promise<boolean> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  const todayKey = `activity_${activityType}_${today.toISOString().split('T')[0]}_${userId}`;
  return localStorage.getItem(todayKey) === 'true';
};

const markTodayActivityLogged = (userId: string, activityType: string) => {
  const today = new Date();
  const todayKey = `activity_${activityType}_${today.toISOString().split('T')[0]}_${userId}`;
  localStorage.setItem(todayKey, 'true');
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

  // Enhanced login that ensures one daily login log per day
  const logLogin = useCallback(async () => {
    if (!user) return;
    
    const hasLoggedToday = await hasLoggedTodayActivity(user.id, 'daily_login');
    if (!hasLoggedToday) {
      await logActivity('daily_login', { timestamp: new Date().toISOString() }, 5);
      markTodayActivityLogged(user.id, 'daily_login');
    }
    
    // Also log the regular login activity
    logActivity(ACTIVITY_TYPES.LOGIN, { timestamp: new Date().toISOString() }, 5);
  }, [logActivity, user]);

  // Convenience methods for common activities
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
    logExerciseView,
    logExerciseStart,
    logExerciseComplete,
    logStudySession,
    logLogout
  };
};
