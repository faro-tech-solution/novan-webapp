'use client';

import { CreateExercise } from "@/components/pages/exercises";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface EditExercisePageProps {
  params: {
    id: string;
  };
}

export default function EditExercisePage({ params }: EditExercisePageProps) {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateExercise exerciseId={params.id} />
    </ProtectedRoute>
  );
} 