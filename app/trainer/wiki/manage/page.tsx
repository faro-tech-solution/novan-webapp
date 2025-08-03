'use client';

import { WikiManagement } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WikiManagementPage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <WikiManagement />
    </ProtectedRoute>
  );
}