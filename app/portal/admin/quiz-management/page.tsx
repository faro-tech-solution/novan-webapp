'use client';

import QuizQuestionManagement from '@/components/quiz/management/QuizQuestionManagement';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function QuizManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <QuizQuestionManagement />
    </ProtectedRoute>
  );
}
