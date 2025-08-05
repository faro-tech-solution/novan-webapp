import { BookOpen, Award, Bell } from "lucide-react";
import { Notification } from "@/types/notification";

export function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "exercise_feedback":
      return <BookOpen className="text-green-500" size={28} />;
    case "award_achieved":
      return <Award className="text-yellow-500" size={28} />;
    default:
      return <Bell className="text-blue-500" size={28} />;
  }
} 