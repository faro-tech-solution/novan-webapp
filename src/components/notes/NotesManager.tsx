'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useExerciseNotes, useAllCourseNotes, useCreateNote, useUpdateNote, useDeleteNote } from '@/hooks/queries/useExerciseNotes';
import { FileText, Plus, Edit2, Trash2, Calendar, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface NotesManagerProps {
  exerciseId?: string;
  courseId?: string;
  showAllNotes?: boolean;
  title?: string;
  showExerciseInfo?: boolean;
  onToggleViewAllNotes?: () => void;
}

export const NotesManager: React.FC<NotesManagerProps> = ({ 
  exerciseId, 
  courseId, 
  showAllNotes = false, 
  title,
  showExerciseInfo = true,
  onToggleViewAllNotes
}) => {
  const { data: exerciseNotesData, isLoading } = useExerciseNotes(exerciseId || '', !!exerciseId);
  const { data: allNotesData, isLoading: allNotesLoading } = useAllCourseNotes(courseId || '', !!courseId);
  const createMutation = useCreateNote();
  const updateMutation = useUpdateNote();
  const deleteMutation = useDeleteNote();

  const notes = exerciseNotesData?.notes || [];
  const allNotes = allNotesData?.notes || [];
  const totalNotes = exerciseNotesData?.totalNotes || allNotesData?.totalNotes || 0;
  
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingNote, setEditingNote] = useState<{ id: string; title: string; content: string } | null>(null);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [noteToDelete, setNoteToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleCreateNote = () => {
    if (!newNoteContent.trim() || !newNoteTitle.trim()) return;

    if (!courseId) {
      console.error('courseId is required for creating notes');
      return;
    }

    createMutation.mutate(
      {
        course_id: courseId,
        title: newNoteTitle,
        content: newNoteContent,
        // exercise_id is optional - if not provided, it will be null (global note)
        ...(exerciseId && { exercise_id: exerciseId })
      },
      {
        onSuccess: () => {
          setNewNoteContent('');
          setNewNoteTitle('');
          setIsNoteDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.content.trim() || !editingNote.title.trim()) return;

    updateMutation.mutate(
      {
        noteId: editingNote.id,
        data: { 
          title: editingNote.title,
          content: editingNote.content 
        },
      },
      {
        onSuccess: () => {
          setEditingNote(null);
          setIsEditDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string, noteTitle: string) => {
    setNoteToDelete({ id: noteId, title: noteTitle });
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      deleteMutation.mutate(noteToDelete.id, {
        onSuccess: () => {
          setNoteToDelete(null);
          setIsDeleteDialogOpen(false);
        }
      });
    }
  };

  const toggleNoteExpansion = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const displayNotes = showAllNotes ? allNotes : notes;
  const isLoadingNotes = showAllNotes ? allNotesLoading : isLoading;

  const getTitle = () => {
    if (title) return title;
    if (showAllNotes) return 'همه یادداشت‌های دوره';
    return 'یادداشت‌های این تمرین';
  };

  const canCreateNote = !!(courseId);

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
          <h3 className="text-lg font-semibold">{getTitle()}</h3>
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
          {onToggleViewAllNotes && (
            <Button variant="outline" onClick={onToggleViewAllNotes}>
              {showAllNotes ? 'بازگشت به یادداشت‌های تمرین' : 'مشاهده تمام یادداشت‌ها'}
            </Button>
          )}
          {canCreateNote && (
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
                <div>
                  <label className="text-sm font-medium mb-2 block">عنوان یادداشت</label>
                  <Input
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="عنوان یادداشت خود را وارد کنید..."
                    className="w-full"
                  />
                </div>
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
                    disabled={!newNoteContent.trim() || !newNoteTitle.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? 'در حال ثبت...' : 'ثبت یادداشت'}
                  </Button>
                </div>
              </div>
              </DialogContent>
            </Dialog>
          )}
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
          {displayNotes.map((note) => {
            const isExpanded = expandedNotes.has(note.id);
            const contentPreview = note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content;
            
            return (
              <Card key={note.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                      <div className="flex flex-row gap-2 text-gray-400 text-sm">
                        {showExerciseInfo && showAllNotes && note.exercises && (
                          <div className="text-xs">
                            تمرین: {note.exercises.title}
                          </div>
                        )}
                        {showExerciseInfo && showAllNotes && !note.exercises && (
                          <div className="text-xs">
                            یادداشت عمومی
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
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingNote({ id: note.id, title: note.title, content: note.content });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id, note.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {isExpanded ? (
                      <div dangerouslySetInnerHTML={{ __html: note.content }} />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: contentPreview }} />
                    )}
                  </div>
                  
                  {note.content.length > 200 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleNoteExpansion(note.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          نمایش کمتر
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          نمایش بیشتر
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ویرایش یادداشت</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">عنوان یادداشت</label>
              <Input
                value={editingNote?.title || ''}
                onChange={(e) => setEditingNote(editingNote ? { ...editingNote, title: e.target.value } : null)}
                placeholder="عنوان یادداشت خود را وارد کنید..."
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">محتوای یادداشت</label>
              <RichTextEditor
                value={editingNote?.content || ''}
                onChange={(value) => setEditingNote(editingNote ? { ...editingNote, content: value } : null)}
                placeholder="یادداشت خود را ویرایش کنید..."
                height="200px"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                انصراف
              </Button>
              <Button
                onClick={handleUpdateNote}
                disabled={!editingNote?.content.trim() || !editingNote?.title.trim() || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأیید حذف یادداشت</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید که می‌خواهید یادداشت "{noteToDelete?.title}" را حذف کنید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'در حال حذف...' : 'حذف یادداشت'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};