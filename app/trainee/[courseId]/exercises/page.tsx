'use client';

import { Exercises } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ExercisesPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <Exercises />
    </ProtectedRoute>
  );
}