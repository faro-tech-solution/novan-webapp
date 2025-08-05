import { supabase } from '@/integrations/supabase/client';
import { StudentActivityLog } from '@/types/student';

export interface ActivityLog {
  id: string;
  student_id: string;
  activity_type: string;
  activity_data?: any;
  points_earned: number;
  created_at: string;
  session_id?: string;
  duration_minutes: number;
}

// Activity types constants (removed PAGE_VISIT, added daily_login)
export const ACTIVITY_TYPES = {
  LOGIN: 'login',
  DAILY_LOGIN: 'daily_login', // Once per day login tracking for streak
  EXERCISE_VIEW: 'exercise_view',
  EXERCISE_START: 'exercise_start',
  EXERCISE_COMPLETE: 'exercise_complete',
  STUDY_SESSION: 'study_session',
  LOGOUT: 'logout'
} as const;

export const logStudentActivity = async (activityData: StudentActivityLog): Promise<string | null> => {
  try {
    console.log('Logging student activity:', activityData);
    
    const { data, error } = await supabase.rpc('log_student_activity', {
      p_student_id: activityData.student_id,
      p_activity_type: activityData.activity_type,
      p_activity_data: activityData.activity_data ?? undefined,
      p_points_earned: activityData.points_earned ?? 0,
      p_session_id: activityData.session_id ?? undefined,
      p_duration_minutes: activityData.duration_minutes ?? 0
    });

    if (error) {
      console.error('Error logging activity:', error);
      return null;
    }

    console.log('Activity logged successfully:', data);
    return data;
  } catch (err) {
    console.error('Error in logStudentActivity:', err);
    return null;
  }
};

export const fetchStudentActivityLogs = async (
  studentId: string, 
  startDate?: Date, 
  endDate?: Date,
  activityType?: string
): Promise<ActivityLog[] | any[]> => {
  try {
    let query = supabase
      .from('student_activity_logs')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('created_at', endDate.toISOString());
    }

    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching activity logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error in fetchStudentActivityLogs:', err);
    return [];
  }
};

export const getWeeklyActivityStats = async (studentId: string): Promise<Array<{ day: string; points: number }>> => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const activities = await fetchStudentActivityLogs(studentId, weekAgo, today);
    const dayNames = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    
    const weeklyStats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.created_at);
        return activityDate >= date && activityDate < nextDay;
      });
      
      const totalPoints = dayActivities.reduce((sum, activity) => sum + activity.points_earned, 0);
      const dayName = dayNames[date.getDay()];
      
      weeklyStats.push({
        day: dayName,
        points: totalPoints
      });
    }
    
    return weeklyStats;
  } catch (err) {
    console.error('Error calculating weekly activity stats:', err);
    return [];
  }
};

// New function to calculate streak based on activity logs
export const calculateActivityStreak = async (studentId: string): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get activities from the last 100 days to check for streak
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 100);
    
    const activities = await fetchStudentActivityLogs(studentId, startDate, today);
    
    if (activities.length === 0) return 0;
    
    // Group activities by date
    const activitiesByDate = new Map<string, boolean>();
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.created_at);
      activityDate.setHours(0, 0, 0, 0);
      const dateKey = activityDate.toISOString().split('T')[0];
      
      // Count any meaningful activity (not just logout)
      if (activity.activity_type !== 'logout') {
        activitiesByDate.set(dateKey, true);
      }
    });
    
    let streak = 0;
    let checkDate = new Date(today);
    
    // Check if there was activity today or yesterday (grace period)
    const todayKey = today.toISOString().split('T')[0];
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(today.getDate() - 1);
    const yesterdayKey = yesterdayDate.toISOString().split('T')[0];
    
    const startFromToday = activitiesByDate.has(todayKey);
    const startFromYesterday = activitiesByDate.has(yesterdayKey);
    
    if (!startFromToday && !startFromYesterday) {
      return 0; // No recent activity, streak is broken
    }
    
    // Start checking from yesterday if no activity today
    if (!startFromToday && startFromYesterday) {
      checkDate = yesterdayDate;
    }
    
    // Count consecutive days backwards
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      
      if (activitiesByDate.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  } catch (err) {
    console.error('Error calculating activity streak:', err);
    return 0;
  }
};

export const getDailyEngagementTime = async (studentId: string, date: Date): Promise<number> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const activities = await fetchStudentActivityLogs(studentId, startOfDay, endOfDay);
    
    return activities.reduce((total, activity) => total + activity.duration_minutes, 0);
  } catch (err) {
    console.error('Error calculating daily engagement time:', err);
    return 0;
  }
};
