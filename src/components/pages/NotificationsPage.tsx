'use client';

import React, { useState, useEffect } from 'react';
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useNotificationTranslation } from "@/utils/notificationTranslationUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NotificationList from "@/components/notification/NotificationList";
import { handleNotificationClick } from "@/utils/notificationUtils";
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const translateNotification = useNotificationTranslation();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getLatestNotifications(50);
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onNotificationClick = (notification: Notification) =>
    handleNotificationClick(notification, setNotifications, (to: string) => router.push(to));

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
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
  );
} 