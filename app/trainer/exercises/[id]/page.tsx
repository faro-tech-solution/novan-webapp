'use client';

import { CreateExercise } from "@/pages/exercises";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface EditExercisePageProps {
  params: {
    id: string;
  };
}

export default function EditExercisePage({ params }: EditExercisePageProps) {
  return (
    <ProtectedRoute requiredRole="trainer">
      <CreateExercise exerciseId={params.id} />
    </ProtectedRoute>
  );
} 