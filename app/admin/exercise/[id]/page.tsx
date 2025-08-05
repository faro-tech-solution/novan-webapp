'use client';

import { ExerciseDetail } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ExerciseDetailPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ExerciseDetail />
    </ProtectedRoute>
  );
}