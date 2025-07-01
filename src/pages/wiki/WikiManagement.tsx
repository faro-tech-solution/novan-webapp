import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWikiCategoriesQuery, useCreateWikiCategoryMutation, useCreateWikiTopicMutation, useDeleteWikiCategoryMutation, useDeleteWikiTopicMutation, useUpdateWikiCategoryMutation } from '@/hooks/useWikiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpen, Plus, Edit, Trash2, FileText, Users, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useCoursesQuery } from '@/hooks/queries/useCoursesQuery';
import DashboardLayout from '@/components/layout/DashboardLayout';

const WikiManagement: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const { data: categories = [], isLoading, error } = useWikiCategoriesQuery();
  const { courses = [] } = useCoursesQuery();
  const createCategoryMutation = useCreateWikiCategoryMutation();
  const createTopicMutation = useCreateWikiTopicMutation();
  const deleteCategoryMutation = useDeleteWikiCategoryMutation();
  const deleteTopicMutation = useDeleteWikiTopicMutation();
  const updateCategoryMutation = useUpdateWikiCategoryMutation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [selectedCategoryForTopic, setSelectedCategoryForTopic] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    description: '',
    access_type: 'all_students' as 'all_students' | 'course_specific',
    course_ids: [] as string[]
  });

  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order_index: 0
  });

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateCategory = async () => {
    try {
      await createCategoryMutation.mutateAsync({
        title: categoryForm.title,
        description: categoryForm.description,
        access_type: categoryForm.access_type,
        course_ids: categoryForm.access_type === 'course_specific' ? categoryForm.course_ids : undefined
      });
      
      toast.success('دسته‌بندی با موفقیت ایجاد شد');
      setShowCreateCategory(false);
      setCategoryForm({ title: '', description: '', access_type: 'all_students', course_ids: [] });
    } catch (error) {
      toast.error('خطا در ایجاد دسته‌بندی');
    }
  };

  const handleCreateTopic = async () => {
    try {
      await createTopicMutation.mutateAsync({
        category_id: selectedCategoryForTopic,
        title: topicForm.title,
        description: topicForm.description,
        order_index: topicForm.order_index
      });
      
      toast.success('موضوع با موفقیت ایجاد شد');
      setShowCreateTopic(false);
      setTopicForm({ title: '', description: '', order_index: 0 });
      setSelectedCategoryForTopic('');
    } catch (error) {
      toast.error('خطا در ایجاد موضوع');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast.success('دسته‌بندی با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف دسته‌بندی');
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteTopicMutation.mutateAsync(topicId);
      toast.success('موضوع با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف موضوع');
    }
  };

  // Helper to open dialog for edit
  const openEditCategory = (category: any) => {
    setCategoryForm({
      title: category.title || '',
      description: category.description || '',
      access_type: category.access_type || 'all_students',
      course_ids: category.course_access ? category.course_access.map((c: any) => c.course_id) : []
    });
    setEditCategoryId(category.id);
    setShowCreateCategory(true);
  };

  // Handle create or update
  const handleCreateOrUpdateCategory = async () => {
    if (editCategoryId) {
      try {
        await updateCategoryMutation.mutateAsync({
          id: editCategoryId,
          data: {
            title: categoryForm.title,
            description: categoryForm.description,
            access_type: categoryForm.access_type,
            course_ids: categoryForm.access_type === 'course_specific' ? categoryForm.course_ids : undefined
          }
        });
        toast.success('دسته‌بندی با موفقیت ویرایش شد');
        setShowCreateCategory(false);
        setEditCategoryId(null);
        setCategoryForm({ title: '', description: '', access_type: 'all_students', course_ids: [] });
      } catch (error) {
        toast.error('خطا در ویرایش دسته‌بندی');
      }
    } else {
      await handleCreateCategory();
    }
  };

  // Reset form on dialog close
  const handleDialogChange = (open: boolean) => {
    setShowCreateCategory(open);
    if (!open) {
      setEditCategoryId(null);
      setCategoryForm({ title: '', description: '', access_type: 'all_students', course_ids: [] });
    }
  };

  // Wait for auth to load before checking permissions
  if (loading) {
    return (
      <DashboardLayout title="مدیریت ویکی">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (profile?.role !== 'admin') {
    return (
      <DashboardLayout title="مدیریت ویکی">
        <Alert>
          <AlertDescription>
            شما مجوز دسترسی به این صفحه را ندارید. (نقش شما: {profile?.role || 'نامشخص'})
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout title="مدیریت ویکی">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مدیریت ویکی">
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری ویکی: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="مدیریت ویکی">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مدیریت ویکی</h1>
          <p className="text-gray-600 mt-2">مدیریت دسته‌بندی‌ها، موضوعات و دسترسی‌ها</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showCreateCategory} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                دسته‌بندی جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editCategoryId ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}</DialogTitle>
                <DialogDescription>
                  {editCategoryId ? 'ویرایش اطلاعات دسته‌بندی ویکی' : 'دسته‌بندی جدیدی برای ویکی ایجاد کنید'}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-title">عنوان</Label>
                  <Input
                    id="category-title"
                    value={categoryForm.title}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان دسته‌بندی"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category-description">توضیحات</Label>
                  <Textarea
                    id="category-description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات دسته‌بندی"
                  />
                </div>
                
                <div>
                  <Label htmlFor="access-type">نوع دسترسی</Label>
                  <Select 
                    value={categoryForm.access_type} 
                    onValueChange={(value: 'all_students' | 'course_specific') => 
                      setCategoryForm(prev => ({ ...prev, access_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_students">همه دانشجویان</SelectItem>
                      <SelectItem value="course_specific">دوره‌های خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {categoryForm.access_type === 'course_specific' && (
                  <div>
                    <Label>دوره‌های مجاز</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {courses.map((course) => (
                        <label key={course.id} className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            checked={categoryForm.course_ids.includes(course.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCategoryForm(prev => ({
                                  ...prev,
                                  course_ids: [...prev.course_ids, course.id]
                                }));
                              } else {
                                setCategoryForm(prev => ({
                                  ...prev,
                                  course_ids: prev.course_ids.filter(id => id !== course.id)
                                }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{course.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => handleDialogChange(false)}>
                  انصراف
                </Button>
                <Button onClick={handleCreateOrUpdateCategory} disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}>
                  {(createCategoryMutation.isPending || updateCategoryMutation.isPending) ? (editCategoryId ? 'در حال ویرایش...' : 'در حال ایجاد...') : (editCategoryId ? 'ویرایش' : 'ایجاد')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateTopic} onOpenChange={setShowCreateTopic}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 ml-2" />
                موضوع جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ایجاد موضوع جدید</DialogTitle>
                <DialogDescription>
                  موضوع جدیدی در دسته‌بندی انتخاب شده ایجاد کنید
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>دسته‌بندی</Label>
                  <Select value={selectedCategoryForTopic} onValueChange={setSelectedCategoryForTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="topic-title">عنوان</Label>
                  <Input
                    id="topic-title"
                    value={topicForm.title}
                    onChange={(e) => setTopicForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="عنوان موضوع"
                  />
                </div>
                
                <div>
                  <Label htmlFor="topic-description">توضیحات</Label>
                  <Textarea
                    id="topic-description"
                    value={topicForm.description}
                    onChange={(e) => setTopicForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات موضوع"
                  />
                </div>
                
                <div>
                  <Label htmlFor="topic-order">ترتیب نمایش</Label>
                  <Input
                    id="topic-order"
                    type="number"
                    value={topicForm.order_index}
                    onChange={(e) => setTopicForm(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateTopic(false)}>
                  انصراف
                </Button>
                <Button 
                  onClick={handleCreateTopic} 
                  disabled={createTopicMutation.isPending || !selectedCategoryForTopic}
                >
                  {createTopicMutation.isPending ? 'در حال ایجاد...' : 'ایجاد'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button asChild variant="outline">
            <Link to="/wiki/create-article">
              <Plus className="h-4 w-4 ml-2" />
              ایجاد مقاله
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="جستجو در دسته‌بندی‌ها..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditCategory(category)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                        <AlertDialogDescription>
                          آیا مطمئن هستید که می‌خواهید دسته‌بندی "{category.title}" را حذف کنید؟
                          تمام موضوعات و مقالات این دسته‌بندی نیز حذف خواهند شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription className="text-sm text-gray-600">
                {category.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                { category.access_type === 'all_students' && 
                  <div className="flex items-center gap-2">
                    <Badge variant={'default'}>
                      همه دانشجویان
                    </Badge>
                  </div>
                }
                
                {category.access_type === 'course_specific' && category.course_access && (
                  <div className="text-xs text-gray-500">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {category.course_access.map((access) => (
                        <Badge key={access.id} variant="outline" className="text-xs">
                          {access.course?.name || 'نامشخص'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button asChild className="w-full">
                  <Link to={`/wiki/category/${category.id}`}>
                    مشاهده محتوا
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ دسته‌بندی یافت نشد</h3>
          <p className="text-gray-600">
            {searchTerm ? 'هیچ دسته‌بندی با این جستجو مطابقت ندارد.' : 'هنوز هیچ دسته‌بندی ایجاد نشده است.'}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default WikiManagement; 