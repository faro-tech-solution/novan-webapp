import React from "react";
import { Notification } from "@/types/notification";
import { getNotificationIcon } from "@/utils/notificationIconUtils";
import { formatDate } from "@/lib/utils";
import { useNotificationTranslation } from "@/utils/notificationTranslationUtils";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationListProps {
  notifications: Notification[];
  loading?: boolean;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading = false,
  onNotificationClick,
}) => {
  const translateNotification = useNotificationTranslation();
  const { language } = useLanguage();
  
  if (loading) {
    return (
      <div className="p-4 text-center text-muted-foreground">در حال بارگذاری اعلانات...</div>
    );
  }
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">{translateNotification('no_notifications').title}</div>
    );
  }

  // Sort: unread first, then read (preserve order within each group)
  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.is_read === b.is_read) return 0;
    return a.is_read ? 1 : -1;
  });

  return (
    <div className="h-[500px] overflow-y-auto">
      {sortedNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex flex-col gap-1 p-4 cursor-pointer border-r-4 transition-colors bg-gray-50 hover:bg-gray-100 rounded-lg ${!notification.is_read ? "bg-yellow-100 border-yellow-400" : "border-gray-400"} text-right flex-row-reverse mb-2`}
          style={{ direction: "rtl" }}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="flex items-start gap-2 flex-row w-full">
            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
            <div className="flex-1 text-right">
              <p className="font-medium">
                {translateNotification(notification.title).title}
              </p>
              {notification.description && (
                <p className="text-sm text-muted-foreground h-[20px] "
                   dangerouslySetInnerHTML={{ __html: translateNotification(notification.description).title }}
                />
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate({dateString: notification.created_at, locale: language})}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 