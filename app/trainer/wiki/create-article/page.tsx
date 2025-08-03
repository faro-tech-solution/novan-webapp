'use client';

import { CreateWikiArticle } from "@/components/pages";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateWikiArticlePage() {
  return (
    <ProtectedRoute requiredRole="trainer">
      <CreateWikiArticle />
    </ProtectedRoute>
  );
}