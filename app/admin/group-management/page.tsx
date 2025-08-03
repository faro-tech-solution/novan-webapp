'use client';

import { GroupManagement } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function GroupManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <GroupManagement />
    </ProtectedRoute>
  );
}