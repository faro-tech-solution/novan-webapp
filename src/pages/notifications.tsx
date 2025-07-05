import { useState, useEffect } from "react";
import { format } from "date-fns";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();

    // Set up real-time subscription
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getLatestNotifications(50); // Get more notifications for the full page
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await NotificationService.markAsRead(notification.id);
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "exercise_feedback":
        return "📝";
      case "award_achieved":
        return "🏆";
      default:
        return "📢";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border ${
                !notification.is_read ? "bg-muted/50" : ""
              } cursor-pointer hover:bg-muted/30 transition-colors`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {notification.icon || getNotificationIcon(notification.type)}
                </span>
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{notification.title}</h3>
                  {notification.description && (
                    <p className="text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(new Date(notification.created_at), "PPp")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
