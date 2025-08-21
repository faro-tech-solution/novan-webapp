'use client';

import { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseCard } from './ExerciseCard';
import { GripVertical, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableExerciseCardProps {
  exercise: Exercise;
  index: number;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  userRole: 'admin' | 'trainer';
  exercises?: (Exercise | any)[]; // For continuous numbering
}

export const DraggableExerciseCard = ({
  exercise,
  index,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  userRole,
  exercises
}: DraggableExerciseCardProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
    onDragStart(e, index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, index);
  };

  return (
    <div
      draggable={userRole === 'admin' || userRole === 'trainer'}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'relative transition-all duration-200',
        isDragging && 'opacity-50 scale-95',
        isDragOver && 'border-2 border-dashed border-teal-400 bg-teal-50',
        userRole === 'admin' || userRole === 'trainer' ? 'cursor-move' : 'cursor-default'
      )}
    >
      {/* Drag Handle */}
      {(userRole === 'admin' || userRole === 'trainer') && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10">
          <div className="bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md transition-shadow">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}

      {/* Exercise Card */}
      <div className={cn(
        'transition-transform duration-200',
        (userRole === 'admin' || userRole === 'trainer') && 'ml-4'
      )}>
        <ExerciseCard exercise={exercise} userRole={userRole} exercises={exercises} />
      </div>

      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-teal-100 bg-opacity-20 border-2 border-dashed border-teal-400 rounded-lg flex items-center justify-center">
          <Move className="h-8 w-8 text-teal-600" />
        </div>
      )}
    </div>
  );
}; 