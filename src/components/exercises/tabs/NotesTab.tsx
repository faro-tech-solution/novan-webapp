'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useExerciseNotes, useAllCourseNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/queries/useExerciseNotes';
import { ExerciseDetail } from '@/types/exercise';
import { FileText, Plus, Edit2, Trash2, Calendar, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NotesTabProps {
  exercise: ExerciseDetail;
}

export const NotesTab: React.FC<NotesTabProps> = ({ exercise }) => {
  const { data: exerciseNotesData, isLoading } = useExerciseNotes(exercise.id);
  const { data: allNotesData, isLoading: allNotesLoading } = useAllCourseNotes(exercise.course_id);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = exerciseNotesData?.notes || [];
  const allNotes = allNotesData?.notes || [];
  const totalNotes = exerciseNotesData?.totalNotes || allNotesData?.totalNotes || 0;
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: string; content: string } | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showAllNotes, setShowAllNotes] = useState(false);

  const handleCreateNote = () => {
    if (!newNoteContent.trim()) return;

    createMutation.mutate(
      {
        exercise_id: exercise.id,
        course_id: exercise.course_id,
        content: newNoteContent,
      },
      {
        onSuccess: () => {
          setNewNoteContent('');
          setIsNoteDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.content.trim()) return;

    updateMutation.mutate(
      {
        noteId: editingNote.id,
        data: { content: editingNote.content },
      },
      {
        onSuccess: () => {
          setEditingNote(null);
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('آیا از حذف این یادداشت مطمئن هستید؟')) {
      deleteMutation.mutate(noteId);
    }
  };

  const handleToggleViewAllNotes = () => {
    setShowAllNotes(!showAllNotes);
  };

  const displayNotes = showAllNotes ? allNotes : notes;
  const isLoadingNotes = showAllNotes ? allNotesLoading : isLoading;

  if (isLoadingNotes) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{showAllNotes ? 'همه یادداشت‌های دوره' : 'یادداشت‌های این تمرین'}</h3>
          {totalNotes > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              نمایش {displayNotes.length || 0} یادداشت از {totalNotes}
            </p>
          )}
          {isLoadingNotes && (
            <p className="text-sm text-gray-500 mt-1">
              در حال بارگذاری یادداشت‌ها...
            </p>
          )}
          {totalNotes === 0 && !isLoadingNotes && (
            <p className="text-sm text-gray-500 mt-1">
              هیچ یادداشتی ثبت نشده است
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleToggleViewAllNotes}>
            {showAllNotes ? 'بازگشت به یادداشت‌های تمرین' : 'مشاهده تمام یادداشت‌ها'}
          </Button>
          <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                افزودن یادداشت
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>یادداشت جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <RichTextEditor
                  value={newNoteContent}
                  onChange={setNewNoteContent}
                  placeholder="یادداشت خود را بنویسید..."
                  height="200px"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                    انصراف
                  </Button>
                  <Button
                    onClick={handleCreateNote}
                    disabled={!newNoteContent.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? 'در حال ثبت...' : 'ثبت یادداشت'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {displayNotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">هیچ یادداشتی ثبت نشده است</p>
            <p className="text-sm text-gray-500 mt-2">اولین یادداشت خود را اضافه کنید</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayNotes.map((note) => (
            <Card key={note.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3 text-gray-400">
                  <div className="flex flex-row gap-2">
                    {showAllNotes && note.exercises && (
                      <div className="text-xs">
                        تمرین: {note.exercises.title}
                      </div>
                    )}
                    <div className="flex items-center text-xs gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate({ dateString: note.created_at })}</span>
                      {note.updated_at !== note.created_at && (
                        <>
                          <span>•</span>
                          <span>آخرین ویرایش: {formatDate({ dateString: note.updated_at })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNote({ id: note.id, content: note.content });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: note.content }} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ویرایش یادداشت</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RichTextEditor
              value={editingNote?.content || ''}
              onChange={(value) => setEditingNote(editingNote ? { ...editingNote, content: value } : null)}
              placeholder="یادداشت خود را ویرایش کنید..."
              height="200px"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                انصراف
              </Button>
              <Button
                onClick={handleUpdateNote}
                disabled={!editingNote?.content.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
