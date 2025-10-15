import { Notification } from "@/types/notification";
import { NotificationService } from "@/services/notification.service";

/**
 * Shared handler for notification click events.
 * @param notification The notification object
 * @param setNotifications Callback to update notifications state
 * @param navigate React Router navigate function
 * @param options Optional: setUnreadCount and setIsOpen for NotificationBell
 */
export async function handleNotificationClick(
  notification: Notification,
  setNotifications: (updater: (prev: Notification[]) => Notification[]) => void,
  navigate: (to: string) => void,
  options?: {
    setUnreadCount?: (updater: (prev: number) => number) => void;
    setIsOpen?: (open: boolean) => void;
  }
) {
  console.log("notification", notification);
  try {
    if (!notification.is_read) {
      await NotificationService.markAsRead(notification.id);
      setNotifications((notifications) =>
        notifications.map((n) =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      if (options?.setUnreadCount) {
        options.setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    }

    // Build redirect URL based on notification type and metadata
    let redirectUrl: string | null = null;
    const meta = notification.metadata || {};
    const course_id = notification.course_id; // course_id is a column in notifications table
    const exercise_id = meta.exercise_id; // exercise_id is in metadata
    
    if (course_id) {
        if (notification.type === "award_achieved") {
            redirectUrl = `/portal/trainee/${course_id}/progress`;
        } else if (notification.type === "exercise_feedback" && exercise_id) {
            redirectUrl = `/portal/trainee/${course_id}/exercise/${exercise_id}`;
        }
    }

    if (redirectUrl) {
      navigate(redirectUrl);
    }
    if (options?.setIsOpen) {
      options.setIsOpen(false);
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
} 