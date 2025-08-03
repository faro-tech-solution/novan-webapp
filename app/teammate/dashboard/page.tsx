'use client';

import { TeammatesDashboard } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TeammatesDashboardPage() {
  return (
    <ProtectedRoute requiredRole="teammate">
      <TeammatesDashboard />
    </ProtectedRoute>
  );
}