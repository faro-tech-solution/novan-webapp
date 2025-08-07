'use client';

import { AllCoursesTrainee } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AllCoursesTraineePage() {
  return (
    <ProtectedRoute requiredRole="trainee">
      <AllCoursesTrainee />
    </ProtectedRoute>
  );
} 