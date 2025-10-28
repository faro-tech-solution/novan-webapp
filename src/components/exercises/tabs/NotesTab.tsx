'use client';

import React, { useState } from 'react';
import { NotesManager } from '@/components/notes';
import { ExerciseDetail } from '@/types/exercise';

interface NotesTabProps {
  exercise: ExerciseDetail;
}

export const NotesTab: React.FC<NotesTabProps> = ({ exercise }) => {
  const [showAllNotes, setShowAllNotes] = useState(false);

  const handleToggleViewAllNotes = () => {
    setShowAllNotes(!showAllNotes);
  };

  return (
    <NotesManager
      exerciseId={exercise.id}
      courseId={exercise.course_id}
      showAllNotes={showAllNotes}
      showExerciseInfo={true}
      onToggleViewAllNotes={handleToggleViewAllNotes}
    />
  );
};