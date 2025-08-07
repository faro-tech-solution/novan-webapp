'use client';

import { CreateExercise } from "@/components/pages/exercises";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateExercisePage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <CreateExercise />
    </ProtectedRoute>
  );
}