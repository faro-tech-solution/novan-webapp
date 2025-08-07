'use client';

import { MyExercises } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function MyExercisesPage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <MyExercises />
    </ProtectedRoute>
  );
}