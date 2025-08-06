import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  BookOpen,
  AlertCircle
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExerciseCategory } from '@/types/exercise';
import { useExerciseCategoriesQuery } from '@/hooks/queries/useExerciseCategoriesQuery';
import { useToast } from '@/hooks/use-toast';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface ExerciseCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  courseName: string;
}

interface CategoryFormData {
  name: string;
  description: string;
}

interface SortableCategoryItemProps {
  category: ExerciseCategory;
  onEdit: (category: ExerciseCategory) => void;
  onDelete: (category: ExerciseCategory) => void;
  editingCategory: ExerciseCategory | null;
  isReordering?: boolean;
}

const SortableCategoryItem = ({ 
  category, 
  onEdit, 
  onDelete, 
  editingCategory,
  isReordering = false
}: SortableCategoryItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`group ${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...(isReordering ? {} : listeners)}
              className={`touch-none ${
                isReordering 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground hover:text-primary" />
            </div>
            <div>
              <h4 className="font-medium">{category.name}</h4>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {category.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {category.exercise_count || 0} تمرین
                </Badge>
                <span className="text-xs text-muted-foreground">
                  ترتیب: {category.order_index + 1}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(category)}
              disabled={!!editingCategory || isReordering}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(category)}
              disabled={!!editingCategory || (category.exercise_count || 0) > 0 || isReordering}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ExerciseCategoriesDialog = ({
  open,
  onOpenChange,
  courseId,
  courseName
}: ExerciseCategoriesDialogProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExerciseCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ExerciseCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: ''
  });

  const { toast } = useToast();
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    isCreating,
    isUpdating,
    isDeleting,
    isReordering
  } = useExerciseCategoriesQuery(courseId);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطا",
        description: "نام دسته‌بندی الزامی است",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        course_id: courseId,
      });

      toast({
        title: "موفقیت",
        description: "دسته‌بندی با موفقیت ایجاد شد",
      });

      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "خطا",
        description: "خطا در ایجاد دسته‌بندی",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast({
        title: "خطا",
        description: "نام دسته‌بندی الزامی است",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCategory({
        categoryId: editingCategory.id,
        categoryData: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }
      });

      toast({
        title: "موفقیت",
        description: "دسته‌بندی با موفقیت بروزرسانی شد",
      });

      setFormData({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "خطا",
        description: "خطا در بروزرسانی دسته‌بندی",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      await deleteCategory(deletingCategory.id);
      toast({
        title: "موفقیت",
        description: "دسته‌بندی با موفقیت حذف شد",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : "خطا در حذف دسته‌بندی",
        variant: "destructive",
      });
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleEditCategory = (category: ExerciseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setFormData({ name: '', description: '' });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((category) => category.id === active.id);
      const newIndex = categories.findIndex((category) => category.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        try {
          // Optimistically update the UI
          const newCategories = arrayMove(categories, oldIndex, newIndex);
          const categoryIds = newCategories.map(category => category.id);
          
          // Call the reorder API
          await reorderCategories(categoryIds);
          
          toast({
            title: "موفقیت",
            description: "ترتیب دسته‌بندی‌ها با موفقیت تغییر کرد",
          });
        } catch (error) {
          console.error('Error reordering categories:', error);
          toast({
            title: "خطا",
            description: "خطا در تغییر ترتیب دسته‌بندی‌ها",
            variant: "destructive",
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مدیریت دسته‌بندی تمرینات</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg">در حال بارگذاری...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>مدیریت دسته‌بندی تمرینات</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-32">
            <div className="text-lg text-red-500">خطا در بارگذاری دسته‌بندی‌ها</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              مدیریت دسته‌بندی تمرینات
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {courseName}
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create Category Form */}
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ایجاد دسته‌بندی جدید</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">نام دسته‌بندی *</Label>
                    <Input
                      id="category-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="مثال: تمرینات پایه"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">توضیحات</Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                      placeholder="توضیحات اختیاری برای دسته‌بندی"
                      height="80px"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleCreateCategory} 
                      disabled={isCreating}
                    >
                      {isCreating ? 'در حال ایجاد...' : 'ایجاد'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelCreate}
                      disabled={isCreating}
                    >
                      انصراف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Category Form */}
            {editingCategory && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ویرایش دسته‌بندی</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category-name">نام دسته‌بندی *</Label>
                    <Input
                      id="edit-category-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="مثال: تمرینات پایه"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-category-description">توضیحات</Label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                      placeholder="توضیحات اختیاری برای دسته‌بندی"
                      height="80px"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdateCategory} 
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'در حال بروزرسانی...' : 'بروزرسانی'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      انصراف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">دسته‌بندی‌ها ({categories.length})</h3>
                  {isReordering && (
                    <span className="text-sm text-muted-foreground animate-pulse">
                      در حال بروزرسانی ترتیب...
                    </span>
                  )}
                </div>
                {!showCreateForm && !editingCategory && (
                  <Button 
                    onClick={() => setShowCreateForm(true)}
                    size="sm"
                    disabled={isReordering}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    دسته‌بندی جدید
                  </Button>
                )}
              </div>

              {categories.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-20 text-muted-foreground">
                    <div className="text-center">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>هیچ دسته‌بندی‌ای وجود ندارد</p>
                      <p className="text-sm">برای شروع، یک دسته‌بندی جدید ایجاد کنید</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={categories.map(cat => cat.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                          onEdit={handleEditCategory}
                          onDelete={setDeletingCategory}
                          editingCategory={editingCategory}
                          isReordering={isReordering}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirmDelete={handleDeleteCategory}
        title="حذف دسته‌بندی"
        description={`آیا از حذف دسته‌بندی "${deletingCategory?.name}" اطمینان دارید؟`}
        isLoading={isDeleting}
      />
    </>
  );
};

export default ExerciseCategoriesDialog; 