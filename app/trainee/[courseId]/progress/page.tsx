'use client';

import { Progress } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProgressPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <Progress />
    </ProtectedRoute>
  );
}