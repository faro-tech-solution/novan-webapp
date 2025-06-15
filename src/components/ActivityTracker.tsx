
import { useEffect, useRef } from 'react';
import { useActivityLogger } from '@/hooks/useActivityLogger';

interface ActivityTrackerProps {
  children: React.ReactNode;
}

export const ActivityTracker = ({ children }: ActivityTrackerProps) => {
  const { logStudySession, logLogin } = useActivityLogger();
  const sessionStartTime = useRef<Date | null>(null);
  const lastActivityTime = useRef<Date>(new Date());
  const accumulatedTime = useRef<number>(0);
  const isActive = useRef<boolean>(true);

  useEffect(() => {
    // Log login when the app starts
    logLogin();
    sessionStartTime.current = new Date();

    // Track user activity
    const updateActivity = () => {
      const now = new Date();
      if (isActive.current && lastActivityTime.current) {
        const timeDiff = now.getTime() - lastActivityTime.current.getTime();
        if (timeDiff < 60000) { // If less than 1 minute since last activity, count as active time
          accumulatedTime.current += timeDiff;
        }
      }
      lastActivityTime.current = now;
      isActive.current = true;
    };

    // Track various user interactions
    const events = ['click', 'keydown', 'scroll', 'mousemove'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    // Track when user becomes inactive
    const handleInactivity = () => {
      isActive.current = false;
    };

    // Set up inactivity timer (5 minutes)
    let inactivityTimer: NodeJS.Timeout;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(handleInactivity, 5 * 60 * 1000); // 5 minutes
    };

    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    // Log study session every 10 minutes
    const sessionInterval = setInterval(() => {
      if (accumulatedTime.current > 0) {
        const sessionMinutes = Math.floor(accumulatedTime.current / (1000 * 60));
        if (sessionMinutes >= 1) {
          console.log(`Logging study session: ${sessionMinutes} minutes`);
          logStudySession(sessionMinutes);
          accumulatedTime.current = 0; // Reset accumulated time
        }
      }
    }, 10 * 60 * 1000); // Every 10 minutes

    // Cleanup function
    return () => {
      // Log final session on unmount
      if (accumulatedTime.current > 0) {
        const sessionMinutes = Math.floor(accumulatedTime.current / (1000 * 60));
        if (sessionMinutes >= 1) {
          logStudySession(sessionMinutes);
        }
      }

      clearInterval(sessionInterval);
      clearTimeout(inactivityTimer);
      
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [logStudySession, logLogin]);

  return <>{children}</>;
};
