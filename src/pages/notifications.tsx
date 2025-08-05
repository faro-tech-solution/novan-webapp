'use client';

import { useEffect, useState } from "react";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNotificationTranslation } from "@/utils/notificationTranslationUtils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import NotificationList from "@/components/notification/NotificationList";
import { handleNotificationClick } from "@/utils/notificationUtils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const translateNotification = useNotificationTranslation();

  console.log({notifications, loading})
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

  const onNotificationClick = (notification: Notification) =>
    handleNotificationClick(notification, setNotifications, (to: string) => router.push(to));

  if (loading) {
    return (
      <DashboardLayout title="اعلانات">
        <div className="flex items-center justify-center min-h-[400px]">
          در حال بارگذاری اعلانات...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={translateNotification('notifications_title').title}>
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{translateNotification('notifications_title').title}</CardTitle>
            <CardDescription className="text-base">{translateNotification('notifications_subtitle').title}</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationList
              notifications={notifications}
              loading={loading}
              onNotificationClick={onNotificationClick}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
