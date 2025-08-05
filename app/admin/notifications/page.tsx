'use client';

import NotificationsPage from "@/pages/notifications";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NotificationsPagePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <NotificationsPage />
    </ProtectedRoute>
  );
}