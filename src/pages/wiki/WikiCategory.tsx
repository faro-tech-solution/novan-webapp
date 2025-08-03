'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useWikiCategoryQuery } from '@/hooks/useWikiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, FileText, Plus, Edit, Trash2, ArrowLeft, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useDeleteWikiTopicMutation, useDeleteWikiArticleMutation } from '@/hooks/useWikiQuery';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const WikiCategory: React.FC = () => {
  const { categoryId, courseId }: any = useParams<{ categoryId: string; courseId?: string }>();
  const { profile } = useAuth();
  const { data: category, isLoading, error } = useWikiCategoryQuery(categoryId!);
  const deleteTopicMutation = useDeleteWikiTopicMutation();
  const deleteArticleMutation = useDeleteWikiArticleMutation();
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (topicId: string) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      await deleteTopicMutation.mutateAsync(topicId);
      toast.success('موضوع با موفقیت حذف شد');
    } catch {
      toast.error('خطا در حذف موضوع');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteArticleMutation.mutateAsync(articleId);
      toast.success('مقاله با موفقیت حذف شد');
    } catch {
      toast.error('خطا در حذف مقاله');
    }
  };

  const hasAccess = () => {
    if (!category) return false;
    
    if (profile?.role === 'admin' || profile?.role === 'trainer') {
      return true;
    }
    
    if (category.access_type === 'all_students') {
      return true;
    }
    
    if (category.access_type === 'course_specific') {
      // This should be checked more thoroughly in a real implementation
      return true; // Simplified for now
    }
    
    return false;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="دسته‌بندی ویکی">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="دسته‌بندی ویکی">
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری دسته‌بندی: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!category) {
    return (
      <DashboardLayout title="دسته‌بندی ویکی">
        <Alert>
          <AlertDescription>
            دسته‌بندی مورد نظر یافت نشد.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!hasAccess()) {
    return (
      <DashboardLayout title={category.title}>
        <div className="text-center py-12">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">دسترسی محدود</h3>
          <p className="text-gray-600">
            این دسته‌بندی فقط برای دانشجویان دوره‌های خاص در دسترس است.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={category.title}>
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={profile?.role === 'trainee' && courseId ? `/trainee/${courseId}/wiki` : `/${profile?.role}/wiki`}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            بازگشت به ویکی
          </Link>
        </Button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
            {category.description && (
              <p className="text-gray-600 mt-2">{category.description}</p>
            )}
            <div className="flex items-center gap-2 mt-3">
              <Badge variant={category.access_type === 'all_students' ? 'default' : 'secondary'}>
                {category.access_type === 'all_students' ? 'همه دانشجویان' : 'دوره‌های خاص'}
              </Badge>
            </div>
          </div>
          
          {(profile?.role === 'admin' || profile?.role === 'trainer') && (
            <div className="flex gap-2">
              <Button asChild>
                <Link href={`/${profile?.role}/wiki/category/${categoryId}/create-topic`}>
                  <Plus className="h-4 w-4 ml-2" />
                  موضوع جدید
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/${profile?.role}/wiki/create-article`}>
                  <FileText className="h-4 w-4 ml-2" />
                  مقاله جدید
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Topics */}
      <div className="space-y-4">
        {category.topics && category.topics.length > 0 ? (
          category.topics.map((topic: any) => (
            <Card key={topic.id}>
              <Collapsible open={expandedTopics.has(topic.id)} onOpenChange={() => toggleTopic(topic.id)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {expandedTopics.has(topic.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <CardTitle className="text-lg">{topic.title}</CardTitle>
                          {topic.description && (
                            <CardDescription className="text-sm text-gray-600 mt-1">
                              {topic.description}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {topic.articles?.length || 0} مقاله
                        </Badge>
                        
                        {/* Admin actions for topic */}
                        {profile?.role === 'admin' && (
                          <div className="flex gap-1">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/wiki/topic/${topic.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف موضوع</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    آیا مطمئن هستید که می‌خواهید موضوع "{topic.title}" را حذف کنید؟
                                    تمام مقالات این موضوع نیز حذف خواهند شد.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>انصراف</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTopic(topic.id)}
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
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {topic.articles && topic.articles.length > 0 ? (
                      <div className="space-y-3">
                        {topic.articles.map((article: any) => (
                          <div key={article.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-600" />
                              <div>
                                <h4 className="font-medium">{article.title}</h4>
                                {article.author && (
                                  <p className="text-xs text-gray-500">
                                    نویسنده: {article.author.first_name} {article.author.last_name}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {!article.is_published && (
                                <Badge variant="secondary" className="text-xs">
                                  پیش‌نویس
                                </Badge>
                              )}
                              
                              <Button asChild size="sm">
                                <Link href={`/wiki/article/${article.id}`}>
                                  مشاهده
                                </Link>
                              </Button>
                              
                              {/* Trainer/Admin actions for article */}
                              {(profile?.role === 'admin' || profile?.role === 'trainer') && (
                                <div className="flex gap-1">
                                  <Button asChild variant="ghost" size="sm">
                                    <Link href={`/wiki/article/${article.id}/edit`}>
                                      <Edit className="h-3 w-3" />
                                    </Link>
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>حذف مقاله</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          آیا مطمئن هستید که می‌خواهید مقاله "{article.title}" را حذف کنید؟
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteArticle(article.id)}
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p>هنوز هیچ مقاله‌ای در این موضوع ایجاد نشده است.</p>
                        {(profile?.role === 'admin' || profile?.role === 'trainer') && (
                          <Button asChild size="sm" className="mt-2">
                            <Link href={`/${profile?.role}/wiki/category/${categoryId}/create-topic`}>
                              <Plus className="h-3 w-3 ml-1" />
                              موضوع جدید
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ موضوعی یافت نشد</h3>
            <p className="text-gray-600 mb-4">
              هنوز هیچ موضوعی در این دسته‌بندی ایجاد نشده است.
            </p>
            {(profile?.role === 'admin' || profile?.role === 'trainer') && (
              <Button asChild>
                <Link href={`/${profile?.role}/wiki/category/${categoryId}/create-topic`}>
                  <Plus className="h-4 w-4 ml-2" />
                  ایجاد موضوع جدید
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WikiCategory; 