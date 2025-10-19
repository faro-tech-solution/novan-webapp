'use client';

import EventManagement from "@/components/events/EventManagement";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminEventsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <EventManagement />
    </ProtectedRoute>
  );
}
