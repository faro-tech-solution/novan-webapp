'use client';

import { AdminExercisesView } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ExercisesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminExercisesView />
    </ProtectedRoute>
  );
}