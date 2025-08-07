'use client';

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useNotificationTranslation } from "@/utils/notificationTranslationUtils";
import { useDashboardPanelContext } from "@/contexts/DashboardPanelContext";
import NotificationList from "@/components/notification/NotificationList";
import { handleNotificationClick } from "@/utils/notificationUtils";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isInitialized, user, profile } = useAuth();
  const translateNotification = useNotificationTranslation();
  
  console.log({notifications, isLoading, unreadCount, isInitialized})

  // Get courseId from context
  const { trainee: { courseId } } = useDashboardPanelContext();

  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchNotifications = async () => {
    if (!isMounted.current) {
      return;
    }

    if (!isInitialized || !user) {
      return;
    }

    try {
      setIsLoading(true);
      
      const [latestNotifications, count] = await Promise.all([
        NotificationService.getLatestNotifications(5),
        NotificationService.getUnreadCount(),
      ]);

        setNotifications(latestNotifications);
        setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (isMounted.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isInitialized || !user) {
      return;
    }

    fetchNotifications();

    // Set up real-time subscription for new notifications
    let subscription: ReturnType<typeof supabase.channel>;

    try {
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
          () => {
            fetchNotifications();
          }
        );
    } catch (err) {
      console.error("Error setting up real-time subscription:", err);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isInitialized, user]);

  const onNotificationClick = (notification: Notification) =>
    handleNotificationClick(notification, setNotifications, (to: string) => router.push(to), {
      setUnreadCount,
      setIsOpen,
    });

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
        <NotificationList
          notifications={notifications}
          loading={isLoading}
          onNotificationClick={onNotificationClick}
        />
        <Button
          variant="ghost"
          className="w-full h-10 border-t rounded-none"
          onClick={() => {
            const userRole = profile?.role || 'trainee';
            if (userRole === 'trainee' && courseId) {
              router.push(`/portal/trainee/${courseId}/notifications`);
            } else {
              router.push(`/portal/${userRole}/notifications`);
            }
            setIsOpen(false);
          }}
        >
          {translateNotification('view_all_notifications').title}
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
