'use client';

import { CreateExercise } from "@/pages/exercises";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateExercisePage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <CreateExercise />
    </ProtectedRoute>
  );
}