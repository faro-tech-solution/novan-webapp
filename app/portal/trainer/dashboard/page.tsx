'use client';

import { TrainerDashboard } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TrainerDashboardPage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <TrainerDashboard />
    </ProtectedRoute>
  );
}