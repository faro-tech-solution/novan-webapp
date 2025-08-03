'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { useWikiArticleQuery } from '@/hooks/useWikiQuery';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, ArrowLeft, Edit, Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import DashboardLayout from '@/components/layout/DashboardLayout';

const WikiArticle: React.FC = () => {
  const params = useParams<{ articleId: string }>();
  const articleId = params?.articleId;
  const { profile } = useAuth();
  const { data: article, isLoading, error } = useWikiArticleQuery(articleId!);

  if (isLoading) {
    return (
      <DashboardLayout title="مقاله ویکی">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="مقاله ویکی">
        <Alert variant="destructive">
          <AlertDescription>
            خطا در بارگذاری مقاله: {error.message}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!article) {
    return (
      <DashboardLayout title="مقاله ویکی">
        <Alert>
          <AlertDescription>
            مقاله مورد نظر یافت نشد.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={article.title}>
      {/* Header */}
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/${profile?.role}/wiki`}>
            <ArrowLeft className="h-4 w-4 ml-2" />
            بازگشت به ویکی
          </Link>
        </Button>
      </div>

      {/* Article */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                {article.title}
              </CardTitle>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>نویسنده: {article.author.first_name} {article.author.last_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: faIR })}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>آخرین بروزرسانی: {format(new Date(article.updated_at), 'dd MMMM yyyy', { locale: faIR })}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!article.is_published && (
                  <Badge variant="secondary">
                    پیش‌نویس
                  </Badge>
                )}
                <Badge variant="outline">
                  ترتیب: {article.order_index}
                </Badge>
              </div>
            </div>
            
            {(profile?.role === 'admin' || profile?.role === 'trainer') && (
              <Button asChild variant="outline">
                <Link href={`/wiki/article/${article.id}/edit`}>
                  <Edit className="h-4 w-4 ml-2" />
                  ویرایش
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose prose-lg max-w-none">
            {/* Content formatting - you might want to use a markdown renderer here */}
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {article.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="flex justify-between items-center">
          <Button asChild variant="outline">
            <Link href={`/${profile?.role}/wiki`}>
              <FileText className="h-4 w-4 ml-2" />
              همه مقالات
            </Link>
          </Button>
          
          {(profile?.role === 'admin' || profile?.role === 'trainer') && (
            <Button asChild>
              <Link href={`/${profile?.role}/wiki/create-article`}>
                <FileText className="h-4 w-4 ml-2" />
                مقاله جدید
              </Link>
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WikiArticle; 