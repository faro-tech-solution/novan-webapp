'use client';

import { TasksManagement } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TasksManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <TasksManagement />
    </ProtectedRoute>
  );
}