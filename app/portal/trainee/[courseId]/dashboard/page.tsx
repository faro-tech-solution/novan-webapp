'use client';

import { TraineeDashboard } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TraineeDashboardPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <TraineeDashboard />
    </ProtectedRoute>
  );
} 