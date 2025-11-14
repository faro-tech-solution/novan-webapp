'use client';

import { CreateCourse } from "@/components/pages/courses";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface EditCoursePageProps {
  params: {
    id: string;
  };
}

export default function EditCoursePage({ params }: EditCoursePageProps) {
  return (
    <ProtectedRoute requiredRole="admin">
      <CreateCourse courseId={params.id} />
    </ProtectedRoute>
  );
}

