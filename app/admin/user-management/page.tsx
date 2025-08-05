'use client';

import { UserManagement } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function UserManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UserManagement />
    </ProtectedRoute>
  );
}