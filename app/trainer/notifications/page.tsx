'use client';

import NotificationsPage from "@/pages/notifications";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NotificationsPagePage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <NotificationsPage />
    </ProtectedRoute>
  );
}