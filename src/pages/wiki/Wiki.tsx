import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWikiCategoriesQuery } from '@/hooks/useWikiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Lock, Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDeleteWikiCategoryMutation } from '@/hooks/useWikiQuery';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Wiki: React.FC = () => {
  const { user, profile } = useAuth();
  const { courseId } = useParams();
  const { data: categories = [], isLoading, error } = useWikiCategoriesQuery();
  const deleteCategoryMutation = useDeleteWikiCategoryMutation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);
      toast.success('دسته‌بندی با موفقیت حذف شد');
    } catch (error) {
      toast.error('خطا در حذف دسته‌بندی');
    }
  };

  const hasAccess = (category: any) => {
    if (profile?.role === 'admin' || profile?.role === 'trainer') {
      return true;
    }
    
    if (category.access_type === 'all_students') {
      return true;
    }
    
    if (category.access_type === 'course_specific') {
      return category.course_access && category.course_access.length > 0;
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="ویکی دانشجویی">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="ویکی دانشجویی">
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری ویکی: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="ویکی دانشجویی">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ویکی دانشجویی</h1>
          <p className="text-gray-600 mt-2">منابع و راهنمای آموزشی</p>
        </div>
        
        {(profile?.role === 'admin' || profile?.role === 'trainer') && (
          <div className="flex gap-2">
            <Button asChild>
              <Link to={`/${profile?.role}/wiki/create-article`}>
                <Plus className="h-4 w-4 ml-2" />
                مقاله جدید
              </Link>
            </Button>
            {profile?.role === 'admin' && (
              <Button asChild variant="outline">
                <Link to={`/${profile?.role}/wiki/manage`}>
                  <Edit className="h-4 w-4 ml-2" />
                  مدیریت
                </Link>
              </Button>
            )}
          </div>
        )}
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
          <Card key={category.id} className={`transition-all duration-200 ${!hasAccess(category) ? 'opacity-60' : 'hover:shadow-lg'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                {!hasAccess(category) && (
                  <Lock className="h-4 w-4 text-gray-400" />
                )}
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
                

                {category.access_type === 'course_specific' && category.course_access && category.course_access.length > 0 && (
                  <div className="text-xs text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {category.course_access.map((access: any) => (
                        <Badge key={access.id} variant="outline" className="text-xs">
                          {access.course?.name || 'نامشخص'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {hasAccess(category) ? (
                  <Button asChild className="w-full">
                    <Link to={profile?.role === 'trainee' && courseId ? `/trainee/${courseId}/wiki/category/${category.id}` : `/${profile?.role}/wiki/category/${category.id}`}>
                      مشاهده محتوا
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      این دسته‌بندی فقط برای دانشجویان دوره‌های خاص در دسترس است
                    </p>
                  </div>
                )}

                {/* Admin actions */}
                {profile?.role === 'admin' && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={`/${profile?.role}/wiki/category/${category.id}/edit`}>
                        <Edit className="h-3 w-3 ml-1" />
                        ویرایش
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle>
                          <AlertDialogDescription>
                            آیا مطمئن هستید که می‌خواهید دسته‌بندی "{category.title}" را حذف کنید؟
                            این عمل غیرقابل بازگشت است.
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
                )}
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

export default Wiki; 