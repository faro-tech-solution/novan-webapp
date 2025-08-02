import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNotificationTranslation } from "@/utils/notificationTranslationUtils";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isInitialized, user } = useAuth();
  const translateNotification = useNotificationTranslation();

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchNotifications = async () => {
    if (!isMounted.current) {
      console.log("Component not mounted, skipping fetch");
      return;
    }

    if (!isInitialized || !user) {
      console.log("Auth not initialized or user not logged in");
      return;
    }

    console.log("Starting to fetch notifications");
    try {
      setError(null);
      setIsLoading(true);
      console.log("Fetching both notifications and unread count");

      const [latestNotifications, count] = await Promise.all([
        NotificationService.getLatestNotifications(5),
        NotificationService.getUnreadCount(),
      ]);

      console.log("Fetch completed:", { latestNotifications, count });

      if (isMounted.current) {
        console.log("Setting notifications state");
        setNotifications(latestNotifications);
        setUnreadCount(count);
      } else {
        console.log("Component unmounted during fetch");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (isMounted.current) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load notifications";
        console.log("Setting error state:", errorMessage);
        setError(errorMessage);
        // Reset notifications to empty state on error
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (isMounted.current) {
        console.log("Setting loading state to false");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!isInitialized || !user) {
      console.log("Auth not initialized or user not logged in");
      return;
    }

    console.log("NotificationBell component mounted");
    fetchNotifications();

    // Set up real-time subscription for new notifications
    let subscription: ReturnType<typeof supabase.channel>;

    try {
      console.log("Setting up Supabase real-time subscription");
      subscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `receiver_id=eq.${user.id}`,
          },
          (payload) => {
            console.log("Received notification change:", payload);
            fetchNotifications();
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
        });
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
    }

    return () => {
      console.log("NotificationBell component unmounting");
      if (subscription) {
        console.log("Unsubscribing from real-time updates");
        subscription.unsubscribe();
      }
    };
  }, [isInitialized, user]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await NotificationService.markAsRead(notification.id);
        setNotifications(
          notifications.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      if (notification.link) {
        navigate(notification.link);
      }

      setIsOpen(false);
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

  if (!isInitialized || !user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications available
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col gap-1 p-4 cursor-pointer ${
                  !notification.is_read ? "bg-muted/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">
                    {notification.icon ||
                      getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">
                      {translateNotification(notification.title).title}
                    </p>
                    {notification.description && (
                      <p className="text-sm text-muted-foreground">
                        {translateNotification(notification.description).title}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.created_at), "PPp")}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <Button
          variant="ghost"
          className="w-full h-10 border-t rounded-none"
          onClick={() => {
            navigate("/notifications");
            setIsOpen(false);
          }}
        >
          View all notifications
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
