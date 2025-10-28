'use client';

import { QAManagement } from "@/components/pages/admin";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function QAManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <QAManagement />
    </ProtectedRoute>
  );
}